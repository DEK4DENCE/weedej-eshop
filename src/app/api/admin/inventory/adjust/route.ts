import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { session: adminSession, error: authError } = await requireAdmin()
  if (authError) return authError

  const { variantId, type, quantity, reason } = await req.json()

  if (!variantId || !type || !quantity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (type !== "IN" && type !== "OUT") {
    return NextResponse.json({ error: "Type must be IN or OUT" }, { status: 400 })
  }

  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty <= 0) {
    return NextResponse.json({ error: "Quantity must be a positive integer" }, { status: 400 })
  }

  const variant = await db.productVariant.findUnique({ where: { id: variantId } })
  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 })
  }

  if (type === "OUT" && variant.stock < qty) {
    return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
  }

  const [updatedVariant] = await db.$transaction([
    db.productVariant.update({
      where: { id: variantId },
      data: { stock: type === "IN" ? { increment: qty } : { decrement: qty } },
    }),
    db.stockMovement.create({
      data: {
        variantId,
        type,
        quantity: qty,
        reason: reason ?? null,
        adminId: adminSession.user.id,
      },
    }),
  ])

  return NextResponse.json({ stock: updatedVariant.stock })
}
