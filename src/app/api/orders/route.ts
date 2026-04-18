import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
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

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('[GET /api/orders]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
