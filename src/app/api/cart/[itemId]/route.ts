import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { quantity } = await req.json()
  if (typeof quantity !== 'number' || quantity < 0) {
    return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } })
    return NextResponse.json({ message: 'Item removed' })
  }

  const item = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: true, variant: true },
  })
  return NextResponse.json(item)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.cartItem.delete({ where: { id: itemId } })
  return NextResponse.json({ message: 'Item removed' })
}
