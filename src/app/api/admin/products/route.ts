import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const body = await req.json()
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!body.slug || typeof body.slug !== 'string' || !body.slug.trim()) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }
  if (!body.categoryId || typeof body.categoryId !== 'string') {
    return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
  }
  const product = await db.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      categoryId: body.categoryId,
      thcContent: body.thcContent,
      cbdContent: body.cbdContent,
      activeSubstance: body.activeSubstance ?? null,
      imageUrls: [],
    },
  })
  revalidatePath("/products")
  return NextResponse.json(product, { status: 201 })
}
