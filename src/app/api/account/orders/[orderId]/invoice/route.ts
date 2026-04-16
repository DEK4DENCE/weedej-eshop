import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId } = await params
  const order = await db.order.findFirst({
    where: { id: orderId, userId: (session.user as any).id },
    select: {
      id: true,
      invoiceNumber: true,
      invoiceUrl: true,
      invoicePdfBase64: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Already cached as base64 in DB
  if (order.invoicePdfBase64) {
    const buf = Buffer.from(order.invoicePdfBase64, 'base64')
    const filename = order.invoiceNumber
      ? `faktura-${order.invoiceNumber}.pdf`
      : 'faktura.pdf'
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buf.length),
      },
    })
  }

  // Fetch from ERP and cache for future requests
  if (order.invoiceUrl) {
    const apiKey = process.env.ERP_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Invoice not available' }, { status: 404 })
    }
    try {
      const res = await fetch(order.invoiceUrl, {
        headers: { 'X-API-Key': apiKey },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        return NextResponse.json({ error: 'Invoice fetch failed' }, { status: 502 })
      }
      const arrayBuf = await res.arrayBuffer()
      const base64 = Buffer.from(arrayBuf).toString('base64')

      // Cache in DB for next time
      await db.order.update({
        where: { id: order.id },
        data: { invoicePdfBase64: base64 },
      }).catch(() => {})

      const buf = Buffer.from(arrayBuf)
      const filename = order.invoiceNumber
        ? `faktura-${order.invoiceNumber}.pdf`
        : 'faktura.pdf'
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(buf.length),
        },
      })
    } catch {
      return NextResponse.json({ error: 'Invoice unavailable' }, { status: 502 })
    }
  }

  return NextResponse.json({ error: 'No invoice available' }, { status: 404 })
}
