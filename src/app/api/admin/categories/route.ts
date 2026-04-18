import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const body = await req.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const slug = typeof body.slug === "string" ? body.slug.trim() : ""
  if (!name || name.length > 100) return NextResponse.json({ error: "name is required (max 100 chars)" }, { status: 400 })
  if (!slug || slug.length > 60) return NextResponse.json({ error: "slug is required (max 60 chars)" }, { status: 400 })
  const category = await db.category.create({ data: { name, slug } })
  revalidatePath("/products")
  revalidatePath("/")
  return NextResponse.json(category, { status: 201 })
}
