import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

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

  const updatedVariant = await db.productVariant.update({
    where: { id: variantId },
    data: { stock: type === "IN" ? { increment: qty } : { decrement: qty } },
  })

  await db.stockMovement.create({
    data: {
      variantId,
      type,
      quantity: qty,
      reason: reason ?? null,
      adminId: (session!.user as any)?.id ?? null,
    },
  })

  return NextResponse.json({ stock: updatedVariant.stock })
}
