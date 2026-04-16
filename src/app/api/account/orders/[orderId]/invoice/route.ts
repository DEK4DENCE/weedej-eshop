import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getErpConfig } from '@/lib/erp'

async function tryFetchInvoice(url: string, apiKey: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(10_000),
    })
    if (res.ok) {
      const contentType = res.headers.get('content-type') ?? ''
      if (contentType.includes('pdf') || contentType.includes('octet-stream')) {
        return res.arrayBuffer()
      }
      // Some ERPs return the PDF even with text/html content-type — try anyway
      const buf = await res.arrayBuffer()
      // Check for PDF magic bytes %PDF
      const header = new Uint8Array(buf.slice(0, 4))
      if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
        return buf
      }
      console.warn(`[Invoice] URL ${url} returned 200 but not a PDF (content-type: ${contentType})`)
      return null
    }
    console.warn(`[Invoice] URL ${url} returned ${res.status}`)
    return null
  } catch (err: any) {
    console.warn(`[Invoice] URL ${url} failed: ${err?.message}`)
    return null
  }
}

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
      erpOrderNumber: true,
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

  const erpConfig = await getErpConfig()
  if (!erpConfig) {
    return NextResponse.json({ error: 'ERP not configured' }, { status: 503 })
  }

  const base = erpConfig.url.replace(/\/$/, '')

  // Build candidate URLs to try, in order of preference
  const candidates: string[] = []

  // 1. Stored invoiceUrl (may be full URL or relative path)
  if (order.invoiceUrl) {
    const full = order.invoiceUrl.startsWith('http')
      ? order.invoiceUrl
      : `${base}${order.invoiceUrl.startsWith('/') ? '' : '/'}${order.invoiceUrl}`
    candidates.push(full)
  }

  // 2. Standard external API patterns by invoice number
  if (order.invoiceNumber) {
    const n = order.invoiceNumber
    candidates.push(`${base}/api/external/invoices/${n}/pdf`)
    candidates.push(`${base}/api/external/invoices/${n}`)
    candidates.push(`${base}/api/invoices/${n}/pdf`)
    candidates.push(`${base}/api/invoices/${n}`)
  }

  // 3. By ERP order number
  if (order.erpOrderNumber) {
    const o = order.erpOrderNumber
    candidates.push(`${base}/api/external/orders/${o}/invoice/pdf`)
    candidates.push(`${base}/api/external/orders/${o}/invoice`)
  }

  // Deduplicate while preserving order
  const seen = new Set<string>()
  const urlsToTry = candidates.filter((u) => {
    if (seen.has(u)) return false
    seen.add(u)
    return true
  })

  console.log(`[Invoice] Trying ${urlsToTry.length} URL(s) for order ${orderId}`)

  for (const url of urlsToTry) {
    const arrayBuf = await tryFetchInvoice(url, erpConfig.key)
    if (arrayBuf) {
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
      console.log(`[Invoice] Success with URL: ${url}`)
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(buf.length),
        },
      })
    }
  }

  console.error(`[Invoice] All ${urlsToTry.length} URL(s) failed for order ${orderId}`)
  return NextResponse.json({ error: 'Invoice unavailable' }, { status: 502 })
}
