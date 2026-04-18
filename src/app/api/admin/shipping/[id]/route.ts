import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  const body = await req.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name || name.length > 100) return NextResponse.json({ error: "name is required (max 100 chars)" }, { status: 400 })
  const price = Number(body.price)
  if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 })
  const method = await db.shippingMethod.update({
    where: { id },
    data: {
      name,
      description: typeof body.description === "string" ? body.description.slice(0, 500) : "",
      price,
      freeThreshold: body.freeThreshold != null ? Number(body.freeThreshold) : null,
      isActive: body.isActive ?? true,
      estimatedDays: typeof body.estimatedDays === "string" ? body.estimatedDays.slice(0, 50) : "",
      sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
    },
  })
  return NextResponse.json(method)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  await db.shippingMethod.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
