// POST /api/admin/erp/sync
// Manuální synchronizace skladu a cen z ERP do eshopu
// Přístupné pouze pro ADMIN uživatele
//
// Co synchronizuje:
//   - Stav skladu (ProductVariant.stock) pro produkty propojené s ERP
//   - Ceny (ProductVariant.price) z ERP
//
// Propojení ERP ↔ Eshop:
//   Eshop ProductVariant má pole erpProductId → odpovídá Product.id v ERP

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpStock, isErpConfigured } from "@/lib/erp"

export async function POST(req: NextRequest) {
  // Auth check — pouze admin
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
    // Najdi všechny varianty s erpProductId
    const variants = await db.productVariant.findMany({
      where: { erpProductId: { not: null } },
      select: { id: true, erpProductId: true, stock: true, price: true },
    })

    if (variants.length === 0) {
      return NextResponse.json({
        message: "Žádné produkty nejsou propojeny s ERP (erpProductId je prázdné)",
        synced: 0,
      })
    }

    // Hromadně načti stav skladu z ERP
    const erpProductIds = [...new Set(variants.map((v) => v.erpProductId!))]
    const erpStock = await getErpStock(erpProductIds)
    const erpMap = new Map(erpStock.map((s) => [s.id, s]))

    // Aktualizuj každou variantu
    let synced = 0
    let skipped = 0
    const updates: Promise<any>[] = []

    for (const variant of variants) {
      const erp = erpMap.get(variant.erpProductId!)
      if (!erp) {
        skipped++
        continue
      }

      // Konverze: ERP cena s DPH → eshop price (eshop ukládá v Kč jako Decimal)
      const newPrice = erp.priceWithVat
      const newStock = Math.max(0, Math.floor(erp.stock)) // Eshop používá celá čísla

      updates.push(
        db.productVariant.update({
          where: { id: variant.id },
          data: { stock: newStock, price: newPrice },
        })
      )
      synced++
    }

    await Promise.all(updates)

    return NextResponse.json({
      message: `Synchronizace dokončena: ${synced} variant aktualizováno, ${skipped} přeskočeno (nenalezeno v ERP)`,
      synced,
      skipped,
      total: variants.length,
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

  // Počet propojených variant
  const linkedCount = configured
    ? await db.productVariant.count({ where: { erpProductId: { not: null } } })
    : 0

  return NextResponse.json({
    configured,
    erpApiUrl: process.env.ERP_API_URL ?? null,
    linkedVariants: linkedCount,
  })
}
