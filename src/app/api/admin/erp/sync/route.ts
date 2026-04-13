// POST /api/admin/erp/sync
// Synchronizace variant a skladu z ERP do eshopu
//
// Co synchronizuje:
//   - Varianty produktů (vytvoří/aktualizuje/smaže) dle ERP EshopVariant
//   - Stav skladu (ProductVariant.stock) pro ERP-propojené produkty
//   - Ceny (ProductVariant.price) z ERP
//
// Propojení ERP ↔ Eshop:
//   Eshop ProductVariant.erpVariantId → EshopVariant.id v ERP
//   Eshop ProductVariant.erpProductId → Product.id v ERP

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpProducts, getErpStock, isErpConfigured } from "@/lib/erp"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 })
  }

  if (!isErpConfigured()) {
    return NextResponse.json(
      { error: "ERP není nakonfigurováno. Nastav ERP_API_URL a ERP_API_KEY v .env" },
      { status: 503 }
    )
  }

  try {
    // Načti všechny ERP produkty včetně jejich variant
    const erpProducts = await getErpProducts()

    // Najdi eshop produkty propojené s ERP (přes erpProductId na variantě)
    const linkedVariants = await db.productVariant.findMany({
      where: { erpProductId: { not: null } },
      select: { id: true, productId: true, erpProductId: true, erpVariantId: true },
    })

    // Mapa: erpProductId → seznam eshop variant tohoto produktu
    const byErpProduct = new Map<string, typeof linkedVariants>()
    for (const v of linkedVariants) {
      const list = byErpProduct.get(v.erpProductId!) ?? []
      list.push(v)
      byErpProduct.set(v.erpProductId!, list)
    }

    // Načti aktuální sklad z ERP (legacy podpora pro varianty bez erpVariantId)
    const erpProductIds = [...new Set(linkedVariants.map((v) => v.erpProductId!))]
    const erpStockList = erpProductIds.length > 0 ? await getErpStock(erpProductIds) : []
    const erpStockMap = new Map(erpStockList.map((s) => [s.id, s]))

    let variantsCreated = 0
    let variantsUpdated = 0
    let variantsDeleted = 0

    for (const erp of erpProducts) {
      const eshopVariantsList = byErpProduct.get(String(erp.id))
      if (!eshopVariantsList?.length) continue

      const productId = eshopVariantsList[0].productId

      // Mapa: erpVariantId → eshop varianta
      const eshopByErpVariantId = new Map(
        eshopVariantsList
          .filter((v) => v.erpVariantId)
          .map((v) => [v.erpVariantId!, v])
      )

      if (erp.eshopVariants && erp.eshopVariants.length > 0) {
        // --- Synchronizace variant z ERP ---
        const erpVariantIds = new Set(erp.eshopVariants.map((v) => v.id))

        // Vytvoř nebo aktualizuj varianty z ERP
        for (const erpVariant of erp.eshopVariants) {
          const existing = eshopByErpVariantId.get(erpVariant.id)

          if (existing) {
            // Aktualizuj
            await db.productVariant.update({
              where: { id: existing.id },
              data: {
                name: erpVariant.name,
                price: erpVariant.price,
                weightGrams: erpVariant.weightGrams ?? null,
                isDefault: erpVariant.isDefault,
              },
            })
            variantsUpdated++
          } else {
            // Vytvoř novou variantu propojenou s ERP variantou
            await db.productVariant.create({
              data: {
                productId,
                name: erpVariant.name,
                price: erpVariant.price,
                weightGrams: erpVariant.weightGrams ?? null,
                isDefault: erpVariant.isDefault,
                stock: 0,
                erpProductId: String(erp.id),
                erpVariantId: erpVariant.id,
              },
            })
            variantsCreated++
          }
        }

        // Smaž eshop varianty, které v ERP už neexistují
        for (const [erpVarId, eshopVar] of eshopByErpVariantId) {
          if (!erpVariantIds.has(erpVarId)) {
            await db.productVariant.delete({ where: { id: eshopVar.id } }).catch(() => {})
            variantsDeleted++
          }
        }
      } else {
        // ERP produkt nemá varianty — aktualizuj legacy varianty přes stock
        const erpStock = erpStockMap.get(String(erp.id))
        if (erpStock) {
          const newPrice = erpStock.priceWithVat
          const newStock = Math.max(0, Math.floor(erpStock.stock))
          for (const eshopVar of eshopVariantsList) {
            await db.productVariant.update({
              where: { id: eshopVar.id },
              data: { stock: newStock, price: newPrice },
            })
            variantsUpdated++
          }
        }
      }
    }

    return NextResponse.json({
      message: `Synchronizace dokončena: ${variantsCreated} variant vytvořeno, ${variantsUpdated} aktualizováno, ${variantsDeleted} smazáno`,
      created: variantsCreated,
      updated: variantsUpdated,
      deleted: variantsDeleted,
    })
  } catch (error: any) {
    console.error("[ERP Sync] Chyba při synchronizaci:", error)
    return NextResponse.json(
      { error: `Synchronizace selhala: ${error.message}` },
      { status: 500 }
    )
  }
}

// GET /api/admin/erp/sync — kontrola stavu ERP připojení
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 })
  }

  const configured = isErpConfigured()

  const linkedCount = configured
    ? await db.productVariant.count({ where: { erpProductId: { not: null } } })
    : 0

  return NextResponse.json({
    configured,
    erpApiUrl: process.env.ERP_API_URL ?? null,
    linkedVariants: linkedCount,
  })
}
