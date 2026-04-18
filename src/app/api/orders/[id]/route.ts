import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        totalAmount: true,
        subtotalAmount: true,
        shippingAmount: true,
        currency: true,
        deliveryType: true,
        erpOrderNumber: true,
        invoiceNumber: true,
        invoiceUrl: true,
        trackingNumber: true,
        carrier: true,
        createdAt: true,
        paidAt: true,
        shippedAt: true,
        deliveredAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            variantId: true,
            productName: true,
            variantLabel: true,
            quantity: true,
            unitPrice: true,
          },
        },
        address: {
          select: {
            id: true,
            fullName: true,
            line1: true,
            line2: true,
            city: true,
            postalCode: true,
            country: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const isOwner = order.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Strip internal userId from the response
    const { userId: _userId, ...safeOrder } = order
    return NextResponse.json({ order: safeOrder })
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
