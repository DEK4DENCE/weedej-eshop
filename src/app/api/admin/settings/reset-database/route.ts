// POST /api/admin/settings/reset-database
// Smaže POUZE objednávky, košíky, skladové pohyby a ERP sync záznamy.
// Zachová: uživatele, nastavení, produkty, varianty, kategorie.
// Pořadí mazání respektuje FK constraints.

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST() {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  try {
    console.log("🗑️  Začínám reset objednávek e-shop databáze...")

    // 1. StockMovement — nemá FK blokátory vůči objednávkám, mazáme první
    const stockMovements = await db.stockMovement.deleteMany({})
    console.log(`  ✓ Smazáno ${stockMovements.count} skladových pohybů`)

    // 2. ErpSyncAttempt — kaskádně z Order, ale pro jistotu napřed
    const syncAttempts = await db.erpSyncAttempt.deleteMany({})
    console.log(`  ✓ Smazáno ${syncAttempts.count} ERP sync pokusů`)

    // 3. CartItem — FK na ProductVariant a Product, musí před Order
    const cartItems = await db.cartItem.deleteMany({})
    console.log(`  ✓ Smazáno ${cartItems.count} položek košíků`)

    // 4. Order → kaskádně smaže OrderItem
    const orders = await db.order.deleteMany({})
    console.log(`  ✓ Smazáno ${orders.count} objednávek (+ položky)`)

    // Produkty, varianty a kategorie se NEZAHAZUJÍ — jsou zachovány.

    console.log("\n✅ Reset objednávek e-shop databáze dokončen!")

    const [userCount, productCount, variantCount, categoryCount] = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.productVariant.count(),
      db.category.count(),
    ])

    return NextResponse.json({
      success: true,
      message: `Reset dokončen!\n\nSmazáno:\n- Objednávky: ${orders.count}\n- Košíky: ${cartItems.count}\n- Skladové pohyby: ${stockMovements.count}\n- ERP sync: ${syncAttempts.count}\n\nZachováno:\n- Produkty: ${productCount}\n- Varianty: ${variantCount}\n- Kategorie: ${categoryCount}\n- Uživatelé: ${userCount}\n- Nastavení zachováno`,
      deleted: {
        orders: orders.count,
        cartItems: cartItems.count,
        stockMovements: stockMovements.count,
        erpSyncAttempts: syncAttempts.count,
      },
      preserved: {
        users: userCount,
        products: productCount,
        variants: variantCount,
        categories: categoryCount,
      },
    })
  } catch (error: any) {
    console.error("❌ Chyba při resetování e-shop databáze:", error)
    return NextResponse.json(
      { error: "Nepodařilo se resetovat databázi", details: error?.message },
      { status: 500 }
    )
  }
}
