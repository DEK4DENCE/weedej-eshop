import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const method = await db.shippingMethod.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description ?? "",
      price: body.price,
      freeThreshold: body.freeThreshold ?? null,
      isActive: body.isActive ?? true,
      estimatedDays: body.estimatedDays ?? "",
      sortOrder: body.sortOrder ?? 0,
    },
  })
  return NextResponse.json(method)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await db.shippingMethod.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
