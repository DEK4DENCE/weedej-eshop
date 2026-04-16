import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getErpConfig } from '@/lib/erp'

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

  // Fetch from ERP and cache
  if (order.invoiceUrl) {
    const erpConfig = await getErpConfig()
    if (!erpConfig) {
      return NextResponse.json({ error: 'ERP not configured' }, { status: 503 })
    }

    // invoiceUrl may be a relative path — prepend ERP base URL if needed
    const fullUrl = order.invoiceUrl.startsWith('http')
      ? order.invoiceUrl
      : `${erpConfig.url.replace(/\/$/, '')}${order.invoiceUrl.startsWith('/') ? '' : '/'}${order.invoiceUrl}`

    try {
      const res = await fetch(fullUrl, {
        headers: { 'X-API-Key': erpConfig.key },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        console.error(`[Invoice] ERP returned ${res.status} for url=${fullUrl}`)
        return NextResponse.json({ error: `Invoice fetch failed (ERP ${res.status})` }, { status: 502 })
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
    } catch (err: any) {
      console.error(`[Invoice] Fetch error:`, err?.message)
      return NextResponse.json({ error: 'Invoice unavailable' }, { status: 502 })
    }
  }

  return NextResponse.json({ error: 'No invoice available' }, { status: 404 })
}
