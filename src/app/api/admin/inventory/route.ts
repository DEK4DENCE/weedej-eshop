/**
 * GET /api/admin/inventory
 *
 * Returns product + variant stock for the admin inventory page.
 * Always fetches live stock from ERP so the admin sees real-time numbers —
 * no webhook infrastructure required, no stale cache.
 *
 * Fallback: if ERP is unreachable, returns the last known values from DB.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpConfig, getErpStock } from "@/lib/erp"

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

  // Load products + variants from DB (structure + metadata)
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

  // Fetch live stock from ERP — if configured
  try {
    const erpConfig = await getErpConfig()
    if (erpConfig) {
      const erpProductIds = [
        ...new Set(
          products.flatMap((p) => p.variants.map((v) => v.erpProductId).filter(Boolean) as string[])
        ),
      ]

      if (erpProductIds.length > 0) {
        const erpItems = await getErpStock(erpProductIds)
        const erpMap   = new Map(erpItems.map((s) => [s.id, s]))

        // Merge live ERP stock into the response
        const enriched = products.map((p) => {
          const firstErpId = p.variants.find((v) => v.erpProductId)?.erpProductId
          const erpItem    = firstErpId ? erpMap.get(firstErpId) : null

          return {
            ...p,
            erpStock: erpItem?.stock  ?? p.erpStock,
            erpUnit:  erpItem?.unit   ?? p.erpUnit,
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

        return NextResponse.json(enriched)
      }
    }
  } catch (err: any) {
    // ERP unreachable — fall through to DB values
    console.warn("[Inventory] ERP fetch failed, returning DB values:", err?.message)
  }

  // Fallback: return DB values as-is
  return NextResponse.json(products)
}
