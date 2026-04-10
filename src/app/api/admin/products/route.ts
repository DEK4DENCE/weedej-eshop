import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
      imageUrls: [],
    },
  })
  return NextResponse.json(product, { status: 201 })
}
