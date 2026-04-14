// GET  /api/admin/erp/import  — otestuje připojení k ERP (URL + klíč v headerech)
// POST /api/admin/erp/import  — importuje produkty z ERP do eshop DB

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function calcVariantStock(
  erpStock: number,
  erpProductUnit: string,
  variantValue: number | null | undefined,
  variantUnit: string | null | undefined,
): number {
  if (!variantValue || variantValue <= 0) return Math.max(0, Math.floor(erpStock))
  const effectiveUnit = variantUnit ?? erpProductUnit
  if (effectiveUnit !== erpProductUnit) return 0
  return Math.max(0, Math.floor(erpStock / variantValue))
}

// ─── Test připojení ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 })
  }

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
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 })
  }

  const body = await req.json()
  const erpUrl: string = (body.erpUrl ?? "").trim()
  const erpKey: string = (body.erpKey ?? "").trim()

  if (!erpUrl || !erpKey) {
    return NextResponse.json({ error: "Chybí erpUrl nebo erpKey" }, { status: 400 })
  }

  // Načti produkty z ERP
  let erpProducts: any[]
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
    erpProducts = await res.json()
  } catch (err: any) {
    const msg = err?.name === "TimeoutError"
      ? "ERP neodpovídá (timeout)."
      : `Chyba připojení k ERP: ${err?.message}`
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  if (!Array.isArray(erpProducts) || erpProducts.length === 0) {
    return NextResponse.json({ created: 0, updated: 0, skipped: 0, message: "ERP nevrátilo žádné produkty." })
  }

  let created = 0
  let updated = 0
  let skipped = 0

  for (const erp of erpProducts) {
    try {
      // Zkontroluj, jestli už produkt existuje (přes erpProductId na variantě)
      const existing = await db.productVariant.findFirst({
        where: { erpProductId: String(erp.id) },
        include: { product: true },
      })

      if (existing) {
        // Aktualizuj základní cenu a název produktu
        await db.product.update({
          where: { id: existing.productId },
          data: { basePrice: erp.priceWithVat, name: erp.name },
        })

        if (erp.eshopVariants && erp.eshopVariants.length > 0) {
          // Synchronizace variant z ERP — match podle jména
          const eshopVariantsList = await db.productVariant.findMany({
            where: { productId: existing.productId, erpProductId: String(erp.id) },
            select: { id: true, name: true },
          })
          const eshopByName = new Map(eshopVariantsList.map((v) => [v.name, v]))
          const erpNames = new Set((erp.eshopVariants as any[]).map((v) => v.name))

          // Smaž zastaralé varianty (např. "Standardní" z původního importu)
          for (const eshopVar of eshopVariantsList) {
            if (!erpNames.has(eshopVar.name)) {
              await db.productVariant.delete({ where: { id: eshopVar.id } }).catch(() => {})
            }
          }

          for (const erpVar of erp.eshopVariants) {
            const varStock = calcVariantStock(Number(erp.stock ?? 0), erp.unit, erpVar.variantValue, erpVar.variantUnit)

            const existingVar = eshopByName.get(erpVar.name)
            if (existingVar) {
              await db.productVariant.update({
                where: { id: existingVar.id },
                data: { price: erpVar.price, variantValue: erpVar.variantValue ?? null, variantUnit: erpVar.variantUnit ?? null, isDefault: erpVar.isDefault, stock: varStock },
              })
            } else {
              await db.productVariant.create({
                data: {
                  productId: existing.productId,
                  name: erpVar.name,
                  price: erpVar.price,
                  variantValue: erpVar.variantValue ?? null,
                  variantUnit: erpVar.variantUnit ?? null,
                  isDefault: erpVar.isDefault,
                  stock: varStock,
                  erpProductId: String(erp.id),
                },
              })
            }
          }
        } else {
          // Fallback: aktualizuj cenu a sklad legacy varianty
          await db.productVariant.update({
            where: { id: existing.id },
            data: {
              price: erp.priceWithVat,
              stock: Math.max(0, Math.floor(Number(erp.stock ?? 0))),
            },
          })
        }
        updated++
        continue
      }

      // Vytvoř nebo najdi kategorii
      let categoryId: string | null = null
      if (erp.category?.name) {
        const slug =
          erp.category.slug ??
          erp.category.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
        const cat = await db.category.upsert({
          where: { slug },
          create: { name: erp.category.name, slug, isActive: true, sortOrder: 0 },
          update: {},
        })
        categoryId = cat.id
      }

      // Slug pro nový produkt
      const baseSlug = (erp.slug ?? erp.name)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      const slug = `${baseSlug}-${String(erp.id).slice(0, 6)}`

      // Vytvoř produkt — isActive: false, admin ho aktivuje po doplnění obrázků
      const productData: any = {
        name: erp.name,
        slug,
        description: erp.description ?? erp.name,
        shortDescription: erp.shortDescription ?? undefined,
        imageUrls: [],
        isActive: false,
        isFeatured: false,
        basePrice: erp.priceWithVat,
        effects: [],
        flavours: [],
        terpenes: [],
      }
      if (categoryId) productData.categoryId = categoryId

      const product = await db.product.create({ data: productData })

      if (erp.eshopVariants && erp.eshopVariants.length > 0) {
        // Vytvoř varianty dle ERP se správným skladem
        for (const erpVar of erp.eshopVariants) {
          const varStock = calcVariantStock(Number(erp.stock ?? 0), erp.unit, erpVar.variantValue, erpVar.variantUnit)
          await db.productVariant.create({
            data: {
              productId: product.id,
              name: erpVar.name,
              price: erpVar.price,
              variantValue: erpVar.variantValue ?? null,
              variantUnit: erpVar.variantUnit ?? null,
              isDefault: erpVar.isDefault,
              stock: varStock,
              erpProductId: String(erp.id),
            },
          })
        }
      } else {
        // Fallback: vytvoř jednu výchozí variantu
        await db.productVariant.create({
          data: {
            productId: product.id,
            name: "Standardní",
            price: erp.priceWithVat,
            stock: Math.max(0, Math.floor(Number(erp.stock ?? 0))),
            isDefault: true,
            erpProductId: String(erp.id),
          },
        })
      }

      created++
    } catch (err: any) {
      console.error(`[ERP Import] Chyba při importu produktu ${erp.id}:`, err?.message)
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
