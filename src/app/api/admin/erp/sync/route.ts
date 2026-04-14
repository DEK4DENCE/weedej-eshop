// POST /api/admin/erp/sync
// Synchronizace variant a skladu z ERP do eshopu
//
// Propojení: ProductVariant.erpProductId → Product.id v ERP
// Matching variant: erpProductId + jméno varianty

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpProducts, isErpConfigured } from "@/lib/erp"

/**
 * Vypočítá počet kusů varianty z celkového skladu ERP produktu.
 *
 * Logika:
 *  - variantValue=null  → varianta nemá definovanou velikost → vrátí celý sklad jako kusy
 *  - unit mismatch       → konfigurace je chybná, bezpečně vrátí 0
 *  - jinak               → floor(erpStock / variantValue)
 *
 * Příklady:
 *  calcVariantStock(3000, "g",  100,  "g")  → 30   (3000g ÷ 100g = 30 balení)
 *  calcVariantStock(2000, "ml", 30,   "ml") → 66   (2000ml ÷ 30ml = 66 lahviček)
 *  calcVariantStock(50,   "ks", 1,    "ks") → 50   (50 ks ÷ 1 ks = 50 kusů)
 *  calcVariantStock(50,   "ks", 3,    "ks") → 16   (50 ks ÷ 3 ks = 16 balení po 3)
 *  calcVariantStock(3000, "g",  null, null) → 3000 (bez variantValue → přímý sklad)
 */
function calcVariantStock(
  erpStock: number,
  erpProductUnit: string,
  variantValue: number | null | undefined,
  variantUnit: string | null | undefined,
): number {
  if (!variantValue || variantValue <= 0) {
    return Math.max(0, Math.floor(erpStock))
  }

  const effectiveUnit = variantUnit ?? erpProductUnit

  if (effectiveUnit !== erpProductUnit) {
    console.warn(
      `[ERP Sync] Unit mismatch: produkt="${erpProductUnit}", varianta="${effectiveUnit}" — sklad varianty nastaven na 0`,
    )
    return 0
  }

  return Math.max(0, Math.floor(erpStock / variantValue))
}

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

    for (const erp of erpProducts) {
      const eshopVariantsList = byErpProduct.get(String(erp.id))
      if (!eshopVariantsList?.length) continue

      const productId = eshopVariantsList[0].productId

      if (erp.eshopVariants && erp.eshopVariants.length > 0) {
        // Mapa: jméno varianty → eshop varianta
        const eshopByName = new Map(eshopVariantsList.map((v) => [v.name, v]))
        const erpNames = new Set(erp.eshopVariants.map((v) => v.name))

        // Nejdřív smaž varianty které v ERP nejsou (včetně starých "Standardní" apod.)
        for (const eshopVar of eshopVariantsList) {
          if (!erpNames.has(eshopVar.name)) {
            await db.productVariant.delete({ where: { id: eshopVar.id } }).catch(() => {})
            variantsDeleted++
          }
        }

        for (const erpVar of erp.eshopVariants) {
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
        }
      } else {
        // ERP produkt nemá varianty — aktualizuj cenu/sklad u všech propojených variant
        for (const eshopVar of eshopVariantsList) {
          await db.productVariant.update({
            where: { id: eshopVar.id },
            data: { price: erp.priceWithVat, stock: Math.max(0, Math.floor(erp.stock)) },
          })
          variantsUpdated++
        }
      }
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
