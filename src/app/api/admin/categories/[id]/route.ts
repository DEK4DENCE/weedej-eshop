import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateSlug } from "@/lib/utils/slug"
export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  const body = await req.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name || name.length > 100) return NextResponse.json({ error: "name is required (max 100 chars)" }, { status: 400 })
  const slug = generateSlug(name)
  const category = await db.category.update({ where: { id }, data: { name, slug } })
  revalidatePath("/products")
  revalidatePath("/")
  return NextResponse.json(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  await db.category.delete({ where: { id } })
  revalidatePath("/products")
  revalidatePath("/")
  return NextResponse.json({ ok: true })
}
