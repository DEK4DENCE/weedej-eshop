import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const { status } = await req.json()

  const order = await db.order.update({ where: { id }, data: { status }, include: { items: true } })

  // Handle stock transitions on status change
  try {
    if (status === "SHIPPED" || status === "DELIVERED") {
      for (const item of order.items) {
        await db.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: "SOLD",
            quantity: item.quantity,
            orderId: id,
            reason: `Order ${status.toLowerCase()}`,
          },
        })
      }
    } else if (status === "CANCELLED") {
      for (const item of order.items) {
        await db.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })
        await db.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: "RELEASED",
            quantity: item.quantity,
            orderId: id,
            reason: "Order cancelled",
          },
        })
      }
    }
  } catch (stockError) {
    console.error("Failed to update stock on order status change:", stockError)
  }

  return NextResponse.json(order)
}
