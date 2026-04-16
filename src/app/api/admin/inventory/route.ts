/**
 * GET /api/admin/inventory
 *
 * Returns product + variant stock for the admin inventory page.
 * Fetches live stock directly from ERP on every request.
 * Falls back to DB values if ERP is unreachable, with a visible warning.
 *
 * Response includes _meta.source = 'erp' | 'db-fallback' so the UI
 * can show the admin whether they're seeing live or stale data.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpConfig, getErpStock } from "@/lib/erp"

export const dynamic = "force-dynamic"

function calcVariantStock(
  erpStock: number,
  erpUnit: string,
  variantValue: number | null | undefined,
  variantUnit: string | null | undefined,
): number {
  if (!variantValue || variantValue <= 0) return Math.max(0, Math.floor(erpStock))
  const effectiveUnit = variantUnit ?? erpUnit
  if (effectiveUnit !== erpUnit) return 0
  return Math.max(0, Math.floor(erpStock / variantValue))
}

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Load all products + variants from e-shop DB (structure, IDs, metadata)
  const products = await db.product.findMany({
    where: { variants: { some: {} } },
    select: {
      id: true,
      name: true,
      erpStock: true,
      erpUnit: true,
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          variantValue: true,
          variantUnit: true,
          erpProductId: true,
        },
        orderBy: { variantValue: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  // Collect all unique ERP product IDs from linked variants
  const erpProductIds = [
    ...new Set(
      products.flatMap((p) =>
        p.variants.map((v) => v.erpProductId).filter((id): id is string => Boolean(id))
      )
    ),
  ]

  // Try to fetch live stock from ERP
  let erpSource: "erp" | "db-fallback" = "db-fallback"
  let erpError: string | null = null

  if (erpProductIds.length === 0) {
    erpError = "Žádné varianty nejsou propojeny s ERP (erpProductId je null). Proveď import produktů z ERP."
  } else {
    try {
      const erpConfig = await getErpConfig()
      if (!erpConfig) {
        erpError = "ERP není nakonfigurováno — nastav ERP URL a API klíč v Nastavení → Propojení s ERP."
      } else {
        const erpItems = await getErpStock(erpProductIds)

        if (erpItems.length === 0) {
          erpError = `ERP vrátilo prázdný seznam pro ${erpProductIds.length} ID. Zkontroluj zda jsou produkty aktivní v ERP.`
        } else {
          const erpMap = new Map(erpItems.map((s) => [s.id, s]))
          const matched = erpItems.length

          const enriched = products.map((p) => {
            const firstErpId = p.variants.find((v) => v.erpProductId)?.erpProductId
            const erpItem    = firstErpId ? erpMap.get(firstErpId) : null

            return {
              ...p,
              erpStock: erpItem?.stock ?? p.erpStock,
              erpUnit:  erpItem?.unit  ?? p.erpUnit,
              variants: p.variants.map((v) => {
                const erp = v.erpProductId ? erpMap.get(v.erpProductId) : null
                return {
                  ...v,
                  stock: erp
                    ? calcVariantStock(erp.stock, erp.unit, v.variantValue, v.variantUnit)
                    : v.stock,
                }
              }),
            }
          })

          return NextResponse.json({
            products: enriched,
            _meta: { source: "erp", matched, requested: erpProductIds.length },
          })
        }
      }
    } catch (err: any) {
      erpError = `ERP nedostupné: ${err?.message ?? "neznámá chyba"}`
      console.error("[Inventory] ERP fetch failed:", err?.message)
    }
  }

  // Fallback: return DB values with visible warning
  return NextResponse.json({
    products,
    _meta: { source: "db-fallback", error: erpError },
  })
}
