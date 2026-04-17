import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  const body = await req.json()
  const { id: _id, ...productData } = body

  const product = await db.product.update({ where: { id }, data: productData })

  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  await db.product.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
