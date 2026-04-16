/**
 * GET /api/cron/erp-sync
 *
 * Background retry job — syncs orders stuck in pending_erp_sync.
 * Protected by CRON_SECRET.
 *
 * Schedule (vercel.json): { "path": "/api/cron/erp-sync", "schedule": "* /5 * * * *" }
 *
 * Retry logic (exponential backoff):
 *   Attempt 1: immediate (Stripe webhook)
 *   Attempt 2: ~5 min after attempt 1
 *   Attempt 3: ~15 min after attempt 2
 *   After 3 fails: status=sync_failed, admin alerted
 *
 * GDPR: logs contain order IDs only — no PII.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getErpConfig, syncOrderToErp } from '@/lib/erp'
import { sendEmail } from '@/lib/email/send'
import { OrderConfirmationWithInvoice } from '@/lib/email/templates/OrderConfirmation'

export const dynamic = 'force-dynamic'

const MAX_ATTEMPTS    = 3
const BACKOFF_MS      = [0, 5 * 60_000, 15 * 60_000]   // 0min, 5min, 15min

export async function GET(req: NextRequest) {
  // Auth
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const erpConfig = await getErpConfig()
  if (!erpConfig) {
    return NextResponse.json({ skipped: true, reason: 'ERP not configured' })
  }

  // Find orders needing retry — those with pending status and enough backoff elapsed
  const candidates = await db.order.findMany({
    where: {
      erpSyncStatus:   'pending_erp_sync',
      erpSyncAttempts: { lt: MAX_ATTEMPTS },
    },
    include: {
      user:    { select: { id: true, name: true, email: true } },
      items:   true,
      address: true,
      syncAttempts: { orderBy: { attemptAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'asc' },
    take: 20,   // process in batches
  })

  let processed = 0
  let succeeded = 0
  let failed    = 0

  for (const order of candidates) {
    const attempts     = order.erpSyncAttempts
    const lastAttempt  = order.syncAttempts[0]?.attemptAt
    const backoffNeeded = BACKOFF_MS[attempts] ?? BACKOFF_MS[BACKOFF_MS.length - 1]

    // Skip if not enough time has passed since last attempt
    if (lastAttempt && backoffNeeded > 0) {
      const elapsed = Date.now() - lastAttempt.getTime()
      if (elapsed < backoffNeeded) continue
    }

    processed++

    try {
      // Rebuild ERP payload from stored order
      const user    = order.user
      const addr    = order.address
      const items   = order.items

      const streetLine = addr
        ? [addr.fullName, addr.line1, addr.line2].filter(Boolean).join(', ')
        : 'Neuvedena'

      // Look up actual VAT rate per product
      const variantIds = items.map((i: any) => i.variantId).filter(Boolean)
      const vatRateMap = new Map<string, number>()
      if (variantIds.length > 0) {
        const variants = await db.productVariant.findMany({
          where:  { id: { in: variantIds } },
          select: { id: true, product: { select: { vatRate: true } } },
        })
        for (const v of variants) vatRateMap.set(v.id, Number(v.product?.vatRate ?? 21))
      }

      const erpItems = items.map((item: any) => {
        const vatRate          = item.variantId ? (vatRateMap.get(item.variantId) ?? 21) : 21
        const unitPriceKc      = (item.unitPrice as number) / 100
        const unitPriceExclVat = Math.round(unitPriceKc / (1 + vatRate / 100) * 100) / 100
        return {
          name:         `${item.productName}${item.variantLabel ? ' — ' + item.variantLabel : ''}`,
          quantity:     item.quantity,   // number of packs ordered
          unit:         'ks',            // per pack
          unitPriceCzk: unitPriceExclVat,
          vatRate,
        }
      })

      const syncResult = await syncOrderToErp({
        eshopOrderId:     order.id,
        items:            erpItems,
        customer: {
          name:  user?.name || user?.email || 'Zákazník',
          email: user?.email || '',
          address: {
            street:  streetLine,
            city:    addr?.city       || 'Neuvedeno',
            zip:     addr?.postalCode || '00000',
            country: addr?.country   || 'CZ',
          },
        },
        totalCzk:         order.totalAmount / 100,
        paymentReference: order.stripePaymentIntentId ?? order.stripeSessionId ?? order.id,
        paidAt:           order.createdAt.toISOString(),
      }, erpConfig)

      // Update order to PROCESSING
      const updatedOrder = await db.order.update({
        where: { id: order.id },
        data: {
          status:           'PROCESSING',
          erpSyncStatus:    'synced',
          erpOrderNumber:   syncResult.erpOrderNumber,
          invoiceNumber:    syncResult.invoiceNumber,
          invoiceUrl:       syncResult.invoicePdfUrl,
          invoicePdfBase64: syncResult.invoicePdfBase64,
          erpSyncAttempts:  attempts + 1,
          erpSyncLastError: null,
        },
      })

      await db.erpSyncAttempt.create({
        data: { orderId: order.id, success: true },
      })

      console.log(`[ErpSync] Retry success orderId=${order.id} erpOrderNumber=${syncResult.erpOrderNumber}`)
      succeeded++

      // Send updated confirmation email now that we have ERP data
      if (user?.email) {
        try {
          const firstName = user.name?.split(' ')[0] ?? 'there'
          const shippingAddr = addr
            ? { fullName: addr.fullName, line1: addr.line1, city: addr.city, postalCode: addr.postalCode, country: addr.country }
            : undefined

          await sendEmail({
            to:      user.email,
            subject: `Potvrzení objednávky ${syncResult.erpOrderNumber} — Weedej`,
            react:   OrderConfirmationWithInvoice({
              name:          firstName,
              orderNumber:   syncResult.erpOrderNumber,
              items:         items.map((i: any) => ({ productName: i.productName, variantLabel: i.variantLabel, quantity: i.quantity, unitPrice: i.unitPrice })),
              subtotalAmount: order.subtotalAmount,
              shippingAmount: order.shippingAmount,
              totalAmount:    order.totalAmount,
              deliveryType:   order.deliveryType,
              shippingAddress: shippingAddr,
              invoiceNumber:  syncResult.invoiceNumber ?? undefined,
            }),
            attachments: syncResult.invoicePdfBase64
              ? [{
                  filename:    `faktura-${syncResult.invoiceNumber ?? syncResult.erpOrderNumber}.pdf`,
                  content:     syncResult.invoicePdfBase64,
                  contentType: 'application/pdf',
                  encoding:    'base64',
                }]
              : [],
          })
        } catch (emailErr) {
          console.error(`[ErpSync] Email failed for orderId=${order.id}:`, (emailErr as any)?.message)
        }
      }
    } catch (err: any) {
      failed++
      const newAttempts = attempts + 1
      const isFinal     = newAttempts >= MAX_ATTEMPTS

      await db.order.update({
        where: { id: order.id },
        data: {
          erpSyncAttempts:  newAttempts,
          erpSyncStatus:    isFinal ? 'sync_failed' : 'pending_erp_sync',
          erpSyncLastError: err?.message ?? 'Unknown error',
        },
      })

      await db.erpSyncAttempt.create({
        data: { orderId: order.id, success: false, error: err?.message },
      })

      console.error(`[ErpSync] Attempt ${newAttempts}/${MAX_ATTEMPTS} failed for orderId=${order.id}:`, err?.message)

      if (isFinal) {
        console.error(`[ErpSync] SYNC FAILED permanently for orderId=${order.id} — alerting admin`)
        await alertAdmin(order.id).catch(() => {})
      }
    }
  }

  return NextResponse.json({ processed, succeeded, failed })
}

async function alertAdmin(orderId: string): Promise<void> {
  const resendKey  = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_ORDER_EMAIL
  if (!resendKey || !adminEmail) return

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    process.env.RESEND_FROM_EMAIL || 'noreply@weedej.cz',
      to:      adminEmail,
      subject: `[ESHOP ALERT] ERP sync selhalo — orderId: ${orderId}`,
      html: `
        <p>ERP synchronizace objednávky <strong>selhala po ${MAX_ATTEMPTS} pokusech</strong>.</p>
        <ul>
          <li><strong>Order ID:</strong> ${orderId}</li>
          <li><strong>Status:</strong> sync_failed (manuální zásah potřeba)</li>
        </ul>
        <p>Přihlas se do admin panelu e-shopu a zkontroluj objednávku.
        Zákazník <strong>zatím nedostal fakturu</strong>.</p>
      `,
    }),
  })
}
