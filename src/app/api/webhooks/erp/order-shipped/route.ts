/**
 * POST /api/webhooks/erp/order-shipped  (Phase 3)
 *
 * Receives ERP → e-shop webhook when warehouse dispatches an order.
 * Validates HMAC-SHA256 signature before processing.
 * Updates order to SHIPPED, sends shipping confirmation email (#2).
 *
 * GDPR:
 *   - Payload contains order IDs only, no PII
 *   - Logs use order IDs only
 * § 28 ZDPH: invoice re-attached in mail #2 (same invoice from mail #1)
 */

import { NextRequest, NextResponse, after } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { OrderShippedWithTracking } from '@/lib/email/templates/OrderShipped'

// Consume raw body for HMAC verification
export const dynamic = 'force-dynamic'

// ─── HMAC helpers ─────────────────────────────────────────────────────────────

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.ERP_WEBHOOK_SECRET
  if (!secret) {
    console.error('[ERPWebhook] ERP_WEBHOOK_SECRET not configured')
    return false
  }
  if (!signatureHeader) return false

  // Header format: "sha256=<hex>"
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(signatureHeader, 'utf8'),
    )
  } catch {
    return false
  }
}

// ─── Timestamp freshness check (replay-attack prevention) ────────────────────
// Requires the ERP to send the Unix epoch seconds of the request as
// x-erp-timestamp header. Requests older than 5 minutes are rejected.
// NOTE: The ERP system MUST be updated to send this header with every request.

function isTimestampFresh(timestampHeader: string | null): boolean {
  if (!timestampHeader) return false
  const ts = parseInt(timestampHeader, 10)
  if (isNaN(ts)) return false
  const ageMs = Date.now() - ts * 1000
  return ageMs >= 0 && ageMs < 5 * 60 * 1000 // 5-minute window
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const sigHeader = req.headers.get('x-erp-signature')

  // MUST validate signature before any processing
  if (!verifySignature(rawBody, sigHeader)) {
    console.warn('[ERPWebhook] Invalid or missing HMAC signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Timestamp check AFTER HMAC so forged timestamps cannot bypass HMAC
  const tsHeader = req.headers.get('x-erp-timestamp')
  if (!isTimestampFresh(tsHeader)) {
    console.warn('[ERPWebhook] Stale or missing timestamp')
    return NextResponse.json({ error: 'Request expired' }, { status: 400 })
  }

  let payload: {
    eshopOrderId:   string
    erpOrderNumber: string
    shippedAt:      string
    trackingNumber: string | null
    carrier:        string | null
    invoiceUrl:     string | null
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { eshopOrderId, erpOrderNumber, shippedAt, trackingNumber, carrier, invoiceUrl } = payload

  if (!eshopOrderId || !erpOrderNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // ── Find order — GDPR: log ID only ─────────────────────────────────────────
  const order = await db.order.findUnique({
    where:   { id: eshopOrderId },
    include: { user: { select: { id: true, name: true, email: true } }, items: true },
  })

  if (!order) {
    // Return 200 to prevent ERP retrying for unknown orders
    console.warn(`[ERPWebhook] Order not found eshopOrderId=${eshopOrderId}`)
    return NextResponse.json({ received: true, warning: 'Order not found' })
  }

  // Idempotency: already shipped
  if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    console.log(`[ERPWebhook] Already shipped orderId=${eshopOrderId}`)
    return NextResponse.json({ received: true, idempotent: true })
  }

  // ── Update to SHIPPED ───────────────────────────────────────────────────────
  const updatedOrder = await db.order.update({
    where: { id: eshopOrderId },
    data: {
      status:        'SHIPPED',
      shippedAt:     shippedAt ? new Date(shippedAt) : new Date(),
      trackingNumber: trackingNumber ?? null,
      carrier:        carrier        ?? null,
      erpOrderNumber: erpOrderNumber,
      invoiceUrl:     invoiceUrl     ?? order.invoiceUrl,
    },
  })

  console.log(`[ERPWebhook] Order shipped orderId=${eshopOrderId} erpOrderNumber=${erpOrderNumber}`)

  // ── Send shipping email (mail #2) ─────────────────────────────────────────
  // Use after() so Vercel keeps the function alive until the email is sent,
  // but the 200 response is returned to ERP immediately (no retry risk).
  after(async () => {
    await sendShippingEmail(order, updatedOrder, trackingNumber, carrier).catch(err =>
      console.error(`[ERPWebhook] Email failed for orderId=${eshopOrderId}:`, err?.message)
    )
  })

  return NextResponse.json({ received: true })
}

async function sendShippingEmail(
  order: any,
  updatedOrder: any,
  trackingNumber: string | null,
  carrier: string | null,
) {
  const user = order.user
  if (!user?.email) return

  const firstName = user.name?.split(' ')[0] ?? 'there'

  // Fetch shipping method estimatedDays from DB
  let estimatedDays: string | undefined
  try {
    const shippingMethod = await db.shippingMethod.findFirst({
      where: { isActive: true, price: { gt: 0 } },
      orderBy: { sortOrder: 'asc' },
      select: { estimatedDays: true },
    })
    estimatedDays = shippingMethod?.estimatedDays ?? undefined
  } catch { /* non-fatal */ }

  // Fetch invoice PDF if we have a URL and stored base64 (for attachment)
  let invoicePdfBase64: string | null = updatedOrder.invoicePdfBase64 ?? null

  // Attempt to fetch from ERP if not cached locally
  if (!invoicePdfBase64 && updatedOrder.invoiceUrl) {
    try {
      const apiKey = process.env.ERP_API_KEY
      if (apiKey) {
        const pdfRes = await fetch(updatedOrder.invoiceUrl, {
          headers: { 'X-API-Key': apiKey },
          signal:  AbortSignal.timeout(8_000),
        })
        if (pdfRes.ok) {
          const buf = await pdfRes.arrayBuffer()
          invoicePdfBase64 = Buffer.from(buf).toString('base64')
          // Cache for future use
          await db.order.update({
            where: { id: updatedOrder.id },
            data: { invoicePdfBase64 },
          }).catch((e) => console.error('[Silent error]', e))
        }
      }
    } catch {
      // Non-fatal — send email without attachment
    }
  }

  const invoiceFilename = updatedOrder.invoiceNumber
    ? `faktura-${updatedOrder.invoiceNumber}.pdf`
    : 'faktura.pdf'

  await sendEmail({
    to:        user.email,
    subject:   `Vaše objednávka ${updatedOrder.erpOrderNumber} je na cestě! — Weedej`,
    emailType: 'orderShipped',
    react:     OrderShippedWithTracking({
      name:          firstName,
      orderNumber:   updatedOrder.erpOrderNumber ?? order.id,
      items:         order.items.map((i: any) => ({
        productName:  i.productName,
        variantLabel: i.variantLabel,
        quantity:     i.quantity,
      })),
      totalAmount:    updatedOrder.totalAmount,
      deliveryType:   updatedOrder.deliveryType,
      trackingNumber: trackingNumber ?? undefined,
      carrier:        carrier        ?? undefined,
      invoiceNumber:  updatedOrder.invoiceNumber ?? undefined,
      estimatedDays,
    }),
    attachments: invoicePdfBase64
      ? [{
          filename:    invoiceFilename,
          content:     invoicePdfBase64,
          contentType: 'application/pdf',
          encoding:    'base64',
        }]
      : [],
  })
}
