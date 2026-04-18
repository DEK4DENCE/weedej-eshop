import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { logAdminAction } from "@/lib/audit"

export async function POST(req: NextRequest) {
  const { session, error: authError } = await requireAdmin()
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

  let product
  try {
    product = await db.product.create({
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
  } catch (err: any) {
    // Prisma unique constraint violation code
    if (err?.code === 'P2002' && err?.meta?.target?.includes?.('slug')) {
      return NextResponse.json({ error: `Slug "${body.slug}" already exists. Choose a unique slug.` }, { status: 409 })
    }
    throw err
  }

  await logAdminAction({
    adminId:    session.user.id as string,
    action:     "CREATE_PRODUCT",
    entityType: "Product",
    entityId:   product.id,
    newValue:   { name: product.name, slug: product.slug, categoryId: product.categoryId },
  }).catch((e: unknown) => console.error("[Audit] logAdminAction failed:", e))

  revalidatePath("/products")
  return NextResponse.json(product, { status: 201 })
}
