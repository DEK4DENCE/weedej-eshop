import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const slug = body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
  const category = await db.category.update({ where: { id }, data: { name: body.name, slug } })
  return NextResponse.json(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await db.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
