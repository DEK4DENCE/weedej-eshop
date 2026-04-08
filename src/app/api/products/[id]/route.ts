import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Determine if param looks like a cuid (starts with 'c' and is ~25 chars) or a slug
    const isCuid = /^c[a-z0-9]{24,}$/.test(id)

    const product = await prisma.product.findUnique({
      where: isCuid ? { id } : { slug: id },
      include: {
        category: true,
        variants: { orderBy: { isDefault: 'desc' } },
      },
    })

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('[GET /api/products/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
