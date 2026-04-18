// GET  /api/admin/erp/import  — otestuje připojení k ERP (URL + klíč v headerech)
// POST /api/admin/erp/import  — importuje produkty z ERP do eshop DB

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { calcVariantStock } from "@/lib/erp/calcVariantStock"
import { generateSlug } from "@/lib/utils/slug"
export const dynamic = 'force-dynamic'

// ─── ERP payload schemas ──────────────────────────────────────────────────────

const ErpEshopVariantSchema = z.object({
  name:         z.string().min(1),
  price:        z.number().positive(),
  isDefault:    z.boolean().optional().default(false),
  variantValue: z.number().optional().nullable(),
  variantUnit:  z.string().optional().nullable(),
})

const ErpCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
})

const ErpProductSchema = z.object({
  id:               z.union([z.string(), z.number()]).transform(String),
  name:             z.string().min(1),
  slug:             z.string().optional(),
  description:      z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  priceWithVat:     z.number().positive(),
  vatRate:          z.number().optional(),
  stock:            z.number().int().min(0).optional().default(0),
  unit:             z.string().optional().default('ks'),
  category:         ErpCategorySchema.optional().nullable(),
  eshopVariants:    z.array(ErpEshopVariantSchema).optional(),
})

const ErpProductsArraySchema = z.array(ErpProductSchema)

type ErpProduct = z.output<typeof ErpProductSchema>

// Patterns like "(THC-X)", "(HHC)", "(CBD)", "(THC)" in product names
const SUBSTANCE_PATTERN = /\s*\((THC-X|THC_X|THC|CBD|HHC)\)\s*/gi

function extractSubstance(name: string): string | null {
  const m = name.match(/\((THC-X|THC_X|THC|CBD|HHC)\)/i)
  if (!m) return null
  const val = m[1].toUpperCase().replace('-', '_')
  // Normalise THC-X → THC_X
  return val === 'THC-X' ? 'THC_X' : val
}

function cleanName(name: string): string {
  return name.replace(SUBSTANCE_PATTERN, ' ').replace(/\s{2,}/g, ' ').trim()
}

// ─── Test připojení ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const erpUrl = req.headers.get("x-erp-url")?.trim()
  const erpKey = req.headers.get("x-erp-key")?.trim()

  if (!erpUrl || !erpKey) {
    return NextResponse.json({ ok: false, error: "Chybí ERP URL nebo API klíč" }, { status: 400 })
  }

  try {
    const res = await fetch(`${erpUrl}/api/external/products`, {
      headers: { "X-API-Key": erpKey },
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `ERP odpovědělo chybou ${res.status}. Zkontrolujte URL a klíč.` },
        { status: 200 }
      )
    }
    const products = await res.json()
    return NextResponse.json({ ok: true, productCount: Array.isArray(products) ? products.length : 0 })
  } catch (err: any) {
    const msg = err?.name === "TimeoutError"
      ? "ERP neodpovídá (timeout). Zkontrolujte URL a jestli ERP běží."
      : `Chyba připojení: ${err?.message ?? "neznámá chyba"}`
    return NextResponse.json({ ok: false, error: msg }, { status: 200 })
  }
}

// ─── Import produktů ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const body = await req.json()
  const erpUrl: string = (body.erpUrl ?? "").trim()
  const erpKey: string = (body.erpKey ?? "").trim()

  if (!erpUrl || !erpKey) {
    return NextResponse.json({ error: "Chybí erpUrl nebo erpKey" }, { status: 400 })
  }

  // Načti produkty z ERP
  let erpProducts: ErpProduct[]
  try {
    const res = await fetch(`${erpUrl}/api/external/products`, {
      headers: { "X-API-Key": erpKey },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `ERP odpovědělo chybou ${res.status}. Zkontrolujte přihlašovací údaje.` },
        { status: 502 }
      )
    }
    const rawData = await res.json()
    const parseResult = ErpProductsArraySchema.safeParse(rawData)
    if (!parseResult.success) {
      console.error('[ERP Import] Invalid ERP response payload:', parseResult.error.flatten())
      return NextResponse.json(
        { error: 'ERP returned invalid data', details: parseResult.error.flatten() },
        { status: 502 }
      )
    }
    erpProducts = parseResult.data
  } catch (err: any) {
    const msg = err?.name === "TimeoutError"
      ? "ERP neodpovídá (timeout)."
      : `Chyba připojení k ERP: ${err?.message}`
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  if (erpProducts.length === 0) {
    return NextResponse.json({ created: 0, updated: 0, skipped: 0, message: "ERP nevrátilo žádné produkty." })
  }

  // Batch fetch all existing variants for all ERP product IDs in one query
  const erpIds = erpProducts.map((p) => p.id)
  const existingVariants = await db.productVariant.findMany({
    where: { erpProductId: { in: erpIds } },
    include: { product: true },
  })
  // Map: erpProductId → first matching variant (with product)
  const existingByErpId = new Map<string, typeof existingVariants[number]>()
  for (const v of existingVariants) {
    if (v.erpProductId && !existingByErpId.has(v.erpProductId)) {
      existingByErpId.set(v.erpProductId, v)
    }
  }

  let created = 0
  let updated = 0
  let skipped = 0

  // C4: Wrap every product import in its own transaction so a failure leaves no orphaned data
  for (const erp of erpProducts) {
    try {
      await db.$transaction(async (tx) => {
        // Use pre-fetched map instead of per-product DB query
        const existing = existingByErpId.get(erp.id) ?? null

        if (existing) {
          // Aktualizuj základní cenu, název a ERP sklad produktu
          const substance = extractSubstance(erp.name)
          const cleanedName = cleanName(erp.name)
          const substanceData = substance && !existing.product.activeSubstance
            ? { activeSubstance: substance as "CBD" | "THC" | "THC_X" | "HHC" }
            : {}
          await tx.product.update({
            where: { id: existing.productId },
            data: { basePrice: erp.priceWithVat, name: cleanedName, vatRate: erp.vatRate ?? 21, erpStock: erp.stock ?? 0, erpUnit: erp.unit ?? null, ...substanceData },
          })

          if (erp.eshopVariants && erp.eshopVariants.length > 0) {
            // Synchronizace variant z ERP — match podle jména
            const eshopVariantsList = await tx.productVariant.findMany({
              where: { productId: existing.productId, erpProductId: erp.id },
              select: { id: true, name: true },
            })
            const eshopByName = new Map(eshopVariantsList.map((v) => [v.name, v]))
            const erpNames = new Set((erp.eshopVariants ?? []).map((v) => v.name))

            // Smaž zastaralé varianty (např. "Standardní" z původního importu) — hromadně
            const staleIds = eshopVariantsList
              .filter((v) => !erpNames.has(v.name))
              .map((v) => v.id)
            if (staleIds.length > 0) {
              await tx.productVariant.deleteMany({ where: { id: { in: staleIds } } })
            }

            for (const erpVar of erp.eshopVariants) {
              const varStock = calcVariantStock(Number(erp.stock ?? 0), erp.unit, erpVar.variantValue, erpVar.variantUnit)

              const existingVar = eshopByName.get(erpVar.name)
              if (existingVar) {
                await tx.productVariant.update({
                  where: { id: existingVar.id },
                  data: { price: erpVar.price, variantValue: erpVar.variantValue ?? null, variantUnit: erpVar.variantUnit ?? null, isDefault: erpVar.isDefault, stock: varStock },
                })
              } else {
                await tx.productVariant.create({
                  data: {
                    productId: existing.productId,
                    name: erpVar.name,
                    price: erpVar.price,
                    variantValue: erpVar.variantValue ?? null,
                    variantUnit: erpVar.variantUnit ?? null,
                    isDefault: erpVar.isDefault,
                    stock: varStock,
                    erpProductId: erp.id,
                  },
                })
              }
            }
          } else {
            // Fallback: aktualizuj cenu a sklad legacy varianty
            await tx.productVariant.update({
              where: { id: existing.id },
              data: {
                price: erp.priceWithVat,
                stock: Math.max(0, Math.floor(Number(erp.stock ?? 0))),
              },
            })
          }
          updated++
          return
        }

        // Vytvoř nebo najdi kategorii
        let categoryId: string | null = null
        if (erp.category?.name) {
          const slug = erp.category.slug ?? generateSlug(erp.category.name)
          const cat = await tx.category.upsert({
            where: { slug },
            create: { name: erp.category.name, slug, isActive: true, sortOrder: 0 },
            update: {},
          })
          categoryId = cat.id
        }

        // Extrakt účinné látky a vyčisti název
        const substance = extractSubstance(erp.name)
        const cleanedName = cleanName(erp.name)

        // Slug pro nový produkt
        const baseSlug = generateSlug(erp.slug ?? cleanedName)
        const slug = `${baseSlug}-${erp.id.slice(0, 6)}`

        // Vytvoř produkt — isActive: false, admin ho aktivuje po doplnění obrázků
        // category is required by schema; throw inside the tx so it rolls back cleanly
        if (!categoryId) throw new Error(`Product ${erp.id} has no category`)

        const product = await tx.product.create({
          data: {
            name: cleanedName,
            slug,
            description: erp.description ?? erp.name,
            shortDescription: erp.shortDescription ?? undefined,
            imageUrls: [],
            isActive: false,
            isFeatured: false,
            basePrice: erp.priceWithVat,
            vatRate: erp.vatRate ?? 21,
            erpStock: erp.stock ?? 0,
            erpUnit: erp.unit ?? null,
            activeSubstance: substance ? (substance as "CBD" | "THC" | "THC_X" | "HHC") : undefined,
            effects: [],
            flavours: [],
            terpenes: [],
            categoryId,
          },
        })

        if (erp.eshopVariants && erp.eshopVariants.length > 0) {
          // Vytvoř varianty dle ERP se správným skladem
          for (const erpVar of erp.eshopVariants) {
            const varStock = calcVariantStock(Number(erp.stock ?? 0), erp.unit, erpVar.variantValue, erpVar.variantUnit)
            await tx.productVariant.create({
              data: {
                productId: product.id,
                name: erpVar.name,
                price: erpVar.price,
                variantValue: erpVar.variantValue ?? null,
                variantUnit: erpVar.variantUnit ?? null,
                isDefault: erpVar.isDefault,
                stock: varStock,
                erpProductId: erp.id,
              },
            })
          }
        } else {
          // Fallback: vytvoř jednu výchozí variantu
          await tx.productVariant.create({
            data: {
              productId: product.id,
              name: "Standardní",
              price: erp.priceWithVat,
              stock: Math.max(0, Math.floor(Number(erp.stock ?? 0))),
              isDefault: true,
              erpProductId: erp.id,
            },
          })
        }

        created++
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[ERP Import] Chyba při importu produktu ${erp.id}:`, message)
      skipped++
    }
  }

  return NextResponse.json({
    created,
    updated,
    skipped,
    message: `Import dokončen: ${created} nových, ${updated} aktualizováno, ${skipped} chyb.`,
  })
}
