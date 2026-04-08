import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrls: true } },
          variant: true,
        },
      },
    },
  })
  return NextResponse.json(cart || { items: [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { variantId, productId, quantity = 1 } = await req.json()
  if (!variantId || !productId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Ensure cart exists
  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  })

  // Upsert cart item
  const item = await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, productId, variantId, quantity },
    update: { quantity: { increment: quantity } },
    include: { product: true, variant: true },
  })

  return NextResponse.json(item, { status: 201 })
}
