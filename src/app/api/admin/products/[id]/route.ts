import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { logAdminAction } from "@/lib/audit"
export const dynamic = 'force-dynamic'

const ALLOWED_PRODUCT_FIELDS = new Set([
  "name", "slug", "description", "shortDescription", "imageUrls",
  "isActive", "isFeatured", "basePrice", "vatRate", "categoryId",
  "thcContent", "cbdContent", "activeSubstance", "effects", "flavours",
  "terpenes", "erpStock", "erpUnit",
])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  const body = await req.json()

  const productData: Record<string, unknown> = {}
  for (const key of Object.keys(body)) {
    if (ALLOWED_PRODUCT_FIELDS.has(key)) productData[key] = body[key]
  }

  // H5: capture old value for audit log
  const before = await db.product.findUnique({ where: { id }, select: { name: true, isActive: true, vatRate: true, basePrice: true } })
  let product
  try {
    product = await db.product.update({ where: { id }, data: productData })
  } catch (err: any) {
    if (err?.code === 'P2002' && err?.meta?.target?.includes?.('slug')) {
      return NextResponse.json({ error: `Slug "${productData.slug}" already exists. Choose a unique slug.` }, { status: 409 })
    }
    throw err
  }

  await logAdminAction({
    adminId:    session.user.id as string,
    action:     "UPDATE_PRODUCT",
    entityType: "Product",
    entityId:   id,
    oldValue:   before,
    newValue:   productData,
  }).catch((e: unknown) => console.error("[Audit] logAdminAction failed:", e))

  revalidatePath("/products")
  revalidatePath(`/products/${product.slug}`)
  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  await db.product.update({ where: { id }, data: { isActive: false } })

  await logAdminAction({
    adminId:    session.user.id as string,
    action:     "DEACTIVATE_PRODUCT",
    entityType: "Product",
    entityId:   id,
    newValue:   { isActive: false },
  }).catch((e: unknown) => console.error("[Audit] logAdminAction failed:", e))

  revalidatePath("/products")
  return NextResponse.json({ success: true })
}
