// POST /api/admin/erp/sync
// Synchronizace variant a skladu z ERP do eshopu
//
// Propojení: ProductVariant.erpProductId → Product.id v ERP
// Matching variant: erpProductId + jméno varianty

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpProducts, isErpConfigured } from "@/lib/erp"
import { calcVariantStock } from "@/lib/erp/calcVariantStock"

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
    const erpProducts = await getErpProducts()

    // Načti všechny eshop varianty propojené s ERP
    const linkedVariants = await db.productVariant.findMany({
      where: { erpProductId: { not: null } },
      select: { id: true, productId: true, erpProductId: true, name: true },
    })

    // Mapa: erpProductId → seznam eshop variant
    const byErpProduct = new Map<string, typeof linkedVariants>()
    for (const v of linkedVariants) {
      const list = byErpProduct.get(v.erpProductId!) ?? []
      list.push(v)
      byErpProduct.set(v.erpProductId!, list)
    }

    let variantsCreated = 0
    let variantsUpdated = 0
    let variantsDeleted = 0

    // PERF-4: Collect all write operations, execute in parallel per product
    // instead of sequential awaits (was 200+ round-trips for 100 products)
    const productErpData = new Map<string, { erpStock: number; erpUnit: string }>()

    await Promise.all(erpProducts.map(async (erp) => {
      const eshopVariantsList = byErpProduct.get(String(erp.id))
      if (!eshopVariantsList?.length) return

      const productId = eshopVariantsList[0].productId
      productErpData.set(productId, { erpStock: erp.stock ?? 0, erpUnit: erp.unit ?? 'ks' })

      // Update product ERP data
      await db.product.update({
        where: { id: productId },
        data: { vatRate: erp.vatRate ?? 21, erpStock: erp.stock ?? 0, erpUnit: erp.unit ?? null },
      })

      if (erp.eshopVariants && erp.eshopVariants.length > 0) {
        const eshopByName = new Map(eshopVariantsList.map((v) => [v.name, v]))
        const erpNames = new Set(erp.eshopVariants.map((v) => v.name))

        // Delete removed variants + update/create existing — all in parallel
        await Promise.all([
          // Deletes
          ...eshopVariantsList
            .filter((v) => !erpNames.has(v.name))
            .map((v) =>
              db.productVariant.delete({ where: { id: v.id } })
                .then(() => { variantsDeleted++ })
                .catch(() => {})
            ),
          // Updates and creates
          ...erp.eshopVariants.map(async (erpVar) => {
            const varStock = calcVariantStock(erp.stock, erp.unit, erpVar.variantValue, erpVar.variantUnit)
            const existing = eshopByName.get(erpVar.name)
            if (existing) {
              await db.productVariant.update({
                where: { id: existing.id },
                data: {
                  price: erpVar.price,
                  variantValue: erpVar.variantValue ?? null,
                  variantUnit: erpVar.variantUnit ?? null,
                  isDefault: erpVar.isDefault,
                  stock: varStock,
                },
              })
              variantsUpdated++
            } else {
              await db.productVariant.create({
                data: {
                  productId,
                  name: erpVar.name,
                  price: erpVar.price,
                  variantValue: erpVar.variantValue ?? null,
                  variantUnit: erpVar.variantUnit ?? null,
                  isDefault: erpVar.isDefault,
                  stock: varStock,
                  erpProductId: String(erp.id),
                },
              })
              variantsCreated++
            }
          }),
        ])
      } else {
        // No ERP variants — update all linked variants in parallel
        await Promise.all(
          eshopVariantsList.map((eshopVar) =>
            db.productVariant.update({
              where: { id: eshopVar.id },
              data: { price: erp.priceWithVat, stock: Math.max(0, Math.floor(erp.stock)) },
            }).then(() => { variantsUpdated++ })
          )
        )
      }
    }))

    // ── Fallback pass: update unlinked variants using ERP data ───────────────────
    const updatedProductIds = [...productErpData.keys()]

    if (updatedProductIds.length > 0) {
      const allUnlinkedVariants = await db.productVariant.findMany({
        where: { productId: { in: updatedProductIds }, erpProductId: null },
        select: { id: true, productId: true, variantValue: true, variantUnit: true },
      })

      await Promise.all(
        allUnlinkedVariants.map((v) => {
          const prod = productErpData.get(v.productId)
          if (!prod || !prod.erpStock) return Promise.resolve()
          const newStock = calcVariantStock(prod.erpStock, prod.erpUnit, v.variantValue, v.variantUnit)
          return db.productVariant.update({
            where: { id: v.id },
            data: { stock: newStock },
          }).then(() => { variantsUpdated++ })
        })
      )
    }

    return NextResponse.json({
      message: `Synchronizace dokončena: ${variantsCreated} vytvořeno, ${variantsUpdated} aktualizováno, ${variantsDeleted} smazáno`,
      created: variantsCreated,
      updated: variantsUpdated,
      deleted: variantsDeleted,
    })
  } catch (error: any) {
    console.error("[ERP Sync] Chyba:", error)
    return NextResponse.json({ error: `Synchronizace selhala: ${error.message}` }, { status: 500 })
  }
}

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
