// POST /api/admin/settings/reset-database
// Smaže objednávky, produkty, varianty, skladové pohyby a košíky.
// Zachová: uživatele, kategorie, nastavení.
// Pořadí mazání respektuje FK constraints.

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    console.log("🗑️  Začínám reset e-shop databáze...")

    // 1. StockMovement → ProductVariant (musí před variantami)
    const stockMovements = await db.stockMovement.deleteMany({})
    console.log(`  ✓ Smazáno ${stockMovements.count} skladových pohybů`)

    // 2. ErpSyncAttempt → Order (kaskádně z Order, ale pro jistotu napřed)
    const syncAttempts = await db.erpSyncAttempt.deleteMany({})
    console.log(`  ✓ Smazáno ${syncAttempts.count} ERP sync pokusů`)

    // 3. CartItem → ProductVariant + Product (musí před variantami a produkty)
    const cartItems = await db.cartItem.deleteMany({})
    console.log(`  ✓ Smazáno ${cartItems.count} položek košíků`)

    // 4. Order → kaskádně smaže OrderItem (OrderItem → ProductVariant + Product)
    const orders = await db.order.deleteMany({})
    console.log(`  ✓ Smazáno ${orders.count} objednávek (+ položky)`)

    // 5. ProductVariant → Product (onDelete: Cascade z Product, ale mazáme explicitně
    //    protože Cart/StockMovement/OrderItem już smazány → žádné bloky)
    const variants = await db.productVariant.deleteMany({})
    console.log(`  ✓ Smazáno ${variants.count} variant produktů`)

    // 6. Product (kategorie zůstanou)
    const products = await db.product.deleteMany({})
    console.log(`  ✓ Smazáno ${products.count} produktů`)

    console.log("\n✅ Reset e-shop databáze dokončen!")

    const [userCount, categoryCount] = await Promise.all([
      db.user.count(),
      db.category.count(),
    ])

    return NextResponse.json({
      success: true,
      message: `Databáze resetována!\n\nZachováno:\n- Uživatelé: ${userCount}\n- Kategorie: ${categoryCount}\n- Nastavení zachováno`,
      deleted: {
        products: products.count,
        variants: variants.count,
        orders: orders.count,
        stockMovements: stockMovements.count,
        cartItems: cartItems.count,
        erpSyncAttempts: syncAttempts.count,
      },
      preserved: {
        users: userCount,
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
