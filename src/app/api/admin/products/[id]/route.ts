import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const { variants, ...productData } = body

  const product = await db.$transaction(async (tx) => {
    const updated = await tx.product.update({ where: { id }, data: productData })

    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v._delete && v.id) {
          await tx.productVariant.delete({ where: { id: v.id } }).catch(() => {})
        } else if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name,
              price: v.price,
              stock: v.stock,
              isDefault: v.isDefault ?? false,
              weightGrams: v.weight ? parseFloat(v.weight) || null : null,
            },
          })
        } else if (!v._delete) {
          await tx.productVariant.create({
            data: {
              productId: id,
              name: v.name,
              price: v.price,
              stock: v.stock,
              isDefault: v.isDefault ?? false,
              weightGrams: v.weight ? parseFloat(v.weight) || null : null,
            },
          })
        }
      }
    }

    return updated
  })

  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await db.product.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
