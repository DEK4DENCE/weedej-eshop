import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'
import { db } from '@/lib/db'
import { getErpConfig } from '@/lib/erp'

async function tryFetchInvoice(url: string, apiKey: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.warn(`[AdminInvoice] URL ${url} returned ${res.status}`)
      return null
    }
    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.includes('pdf') || contentType.includes('octet-stream')) {
      return res.arrayBuffer()
    }
    const buf = await res.arrayBuffer()
    const header = new Uint8Array(buf.slice(0, 4))
    if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
      return buf
    }
    console.warn(`[AdminInvoice] URL ${url} returned 200 but not a PDF (content-type: ${contentType})`)
    return null
  } catch (err: any) {
    console.warn(`[AdminInvoice] URL ${url} failed: ${err?.message}`)
    return null
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const refresh = req.nextUrl.searchParams.get('refresh') === '1'

  const order = await db.order.findUnique({
    where: { id },
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

  // Serve cached base64 unless ?refresh=1 is set
  if (order.invoicePdfBase64 && !refresh) {
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
  const candidates: string[] = []

  if (order.invoiceUrl) {
    const full = order.invoiceUrl.startsWith('http')
      ? order.invoiceUrl
      : `${base}${order.invoiceUrl.startsWith('/') ? '' : '/'}${order.invoiceUrl}`
    candidates.push(full)
  }

  if (order.invoiceNumber) {
    const n = order.invoiceNumber
    candidates.push(`${base}/api/external/invoices/${n}/pdf`)
    candidates.push(`${base}/api/external/invoices/${n}`)
    candidates.push(`${base}/api/invoices/${n}/pdf`)
    candidates.push(`${base}/api/invoices/${n}`)
  }

  if (order.erpOrderNumber) {
    const o = order.erpOrderNumber
    candidates.push(`${base}/api/external/orders/${o}/invoice/pdf`)
    candidates.push(`${base}/api/external/orders/${o}/invoice`)
  }

  const seen = new Set<string>()
  const urlsToTry = candidates.filter((u) => {
    if (seen.has(u)) return false
    seen.add(u)
    return true
  })

  console.log(`[AdminInvoice] Trying ${urlsToTry.length} URL(s) for order ${id}`)

  for (const url of urlsToTry) {
    const arrayBuf = await tryFetchInvoice(url, erpConfig.key)
    if (arrayBuf) {
      const base64 = Buffer.from(arrayBuf).toString('base64')
      await db.order.update({
        where: { id: order.id },
        data: { invoicePdfBase64: base64, invoiceUrl: url },
      }).catch(() => {})

      const buf = Buffer.from(arrayBuf)
      const filename = order.invoiceNumber
        ? `faktura-${order.invoiceNumber}.pdf`
        : 'faktura.pdf'
      console.log(`[AdminInvoice] Success with URL: ${url}`)
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(buf.length),
        },
      })
    }
  }

  console.error(`[AdminInvoice] All ${urlsToTry.length} URL(s) failed for order ${id}`)
  return NextResponse.json({ error: 'Invoice unavailable' }, { status: 502 })
}
