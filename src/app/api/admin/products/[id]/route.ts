import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

const ALLOWED_PRODUCT_FIELDS = new Set([
  "name", "slug", "description", "shortDescription", "imageUrls",
  "isActive", "isFeatured", "basePrice", "vatRate", "categoryId",
  "thcContent", "cbdContent", "activeSubstance", "effects", "flavours",
  "terpenes", "erpStock", "erpUnit",
])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  const body = await req.json()

  const productData: Record<string, unknown> = {}
  for (const key of Object.keys(body)) {
    if (ALLOWED_PRODUCT_FIELDS.has(key)) productData[key] = body[key]
  }

  const product = await db.product.update({ where: { id }, data: productData })
  revalidatePath("/products")
  revalidatePath(`/products/${product.slug}`)
  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  await db.product.update({ where: { id }, data: { isActive: false } })
  revalidatePath("/products")
  return NextResponse.json({ success: true })
}
