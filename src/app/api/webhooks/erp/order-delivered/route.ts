/**
 * POST /api/webhooks/erp/order-delivered
 *
 * Fired by ERP when admin marks an eshop order as "Doručeno".
 * Verifies HMAC-SHA256, sets order status to DELIVERED.
 *
 * Payload: { eshopOrderId: string, erpOrderNumber: string, deliveredAt: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import React from 'react'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { OrderDelivered } from '@/lib/email/templates/OrderDelivered'

export const dynamic = 'force-dynamic'

function verifySignature(rawBody: string, sigHeader: string | null): boolean {
  const secret = process.env.ERP_WEBHOOK_SECRET
  if (!secret || !sigHeader) return false
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sigHeader, 'utf8'))
  } catch { return false }
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

export async function POST(req: NextRequest) {
  const rawBody   = await req.text()
  const sigHeader = req.headers.get('x-erp-signature')

  if (!verifySignature(rawBody, sigHeader)) {
    console.warn('[OrderDelivered] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Timestamp check AFTER HMAC so forged timestamps cannot bypass HMAC
  const tsHeader = req.headers.get('x-erp-timestamp')
  if (!isTimestampFresh(tsHeader)) {
    console.warn('[ERPWebhook] Stale or missing timestamp')
    return NextResponse.json({ error: 'Request expired' }, { status: 400 })
  }

  let payload: { eshopOrderId?: string; erpOrderNumber?: string; deliveredAt?: string }
  try { payload = JSON.parse(rawBody) }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { eshopOrderId, deliveredAt } = payload
  if (!eshopOrderId) return NextResponse.json({ error: 'Missing eshopOrderId' }, { status: 400 })

  const order = await db.order.findUnique({
    where: { id: eshopOrderId },
    select: {
      id: true, status: true, totalAmount: true,
      erpOrderNumber: true,
      items: { select: { productName: true, variantLabel: true, quantity: true } },
      user: { select: { email: true, name: true } },
    },
  })
  if (!order) {
    console.warn(`[OrderDelivered] Order not found eshopOrderId=${eshopOrderId}`)
    return NextResponse.json({ received: true, warning: 'Order not found' })
  }

  if (order.status === 'DELIVERED') {
    return NextResponse.json({ received: true, idempotent: true })
  }

  await db.order.update({
    where: { id: eshopOrderId },
    data: {
      status:      'DELIVERED',
      deliveredAt: deliveredAt ? new Date(deliveredAt) : new Date(),
    },
  })

  console.log(`[OrderDelivered] Order marked delivered eshopOrderId=${eshopOrderId}`)

  // Send delivery confirmation email
  try {
    const customerEmail = order.user?.email
    const customerName  = order.user?.name ?? customerEmail?.split('@')[0] ?? 'Zákazníku'
    const orderNumber   = order.erpOrderNumber ?? order.id
    const displayNumber = order.erpOrderNumber ?? `#${order.id.slice(-8).toUpperCase()}`

    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: `Vaše objednávka ${displayNumber} byla doručena`,
        emailType: 'orderDelivered',
        react: React.createElement(OrderDelivered, {
          name: customerName,
          orderNumber,
          items: order.items.map((i) => ({
            productName:  i.productName,
            variantLabel: i.variantLabel,
            quantity:     i.quantity,
          })),
          totalAmount: order.totalAmount,
        }),
      })
    }
  } catch (emailError) {
    console.error('[OrderDelivered] Failed to send email:', emailError)
  }

  return NextResponse.json({ received: true })
}
