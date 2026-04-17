/**
 * POST /api/webhooks/erp/stock-update
 *
 * Receives ERP → e-shop stock push after any InventoryItem change.
 * The ERP calculates current stock and sends it here — no callback needed.
 *
 * Payload: { products: [{ erpProductId: string, stock: number, unit: string }] }
 * Security: HMAC-SHA256 via X-ERP-Signature header (ERP_WEBHOOK_SECRET)
 *
 * For each product, finds all linked ProductVariants (by erpProductId),
 * recalculates their stock using calcVariantStock(), and updates the DB.
 * Responds 200 immediately; DB writes happen async.
 *
 * M15 merge strategy: erpStock tracks the last ERP-reported value.
 * stock is only overwritten if it still equals erpStock (no manual override).
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { db } from '@/lib/db'
import { calcVariantStock } from '@/lib/erp/calcVariantStock'

export const dynamic = 'force-dynamic'

// ─── Zod schema for stock-update webhook payload ──────────────────────────────

const StockUpdateItemSchema = z.object({
  erpProductId: z.string().min(1),
  stock:        z.number().int().min(0),
  unit:         z.string().default('ks'),
})

const StockUpdatePayloadSchema = z.object({
  products: z.array(StockUpdateItemSchema).min(1),
})

type StockUpdateItem = z.output<typeof StockUpdateItemSchema>

// ─── HMAC verification ────────────────────────────────────────────────────────

function verifySignature(rawBody: string, sigHeader: string | null): boolean {
  const secret = process.env.ERP_WEBHOOK_SECRET
  if (!secret || !sigHeader) return false
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sigHeader, 'utf8'))
  } catch { return false }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody   = await req.text()
  const sigHeader = req.headers.get('x-erp-signature')

  if (!verifySignature(rawBody, sigHeader)) {
    console.warn('[StockWebhook] Invalid or missing HMAC signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let rawPayload: unknown
  try { rawPayload = JSON.parse(rawBody) }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const parseResult = StockUpdatePayloadSchema.safeParse(rawPayload)
  if (!parseResult.success) {
    console.error('[StockWebhook] Invalid payload:', parseResult.error.flatten())
    return NextResponse.json(
      { error: 'Invalid payload', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  const { products } = parseResult.data

  // Respond 200 immediately — writes happen async so ERP is never blocked
  applyStockUpdate(products).catch(err =>
    console.error('[StockWebhook] applyStockUpdate error:', err?.message)
  )

  return NextResponse.json({ received: true })
}

// ─── Async writer ─────────────────────────────────────────────────────────────

async function applyStockUpdate(updates: StockUpdateItem[]): Promise<void> {
  const erpProductIds = updates.map(u => u.erpProductId)

  // Load all e-shop variants linked to these ERP products
  // Include stock + erpStock to detect manual overrides (M15)
  const variants = await db.productVariant.findMany({
    where:  { erpProductId: { in: erpProductIds } },
    select: { id: true, erpProductId: true, variantValue: true, variantUnit: true, productId: true, stock: true, erpStock: true },
  })

  let updated = 0

  for (const upd of updates) {
    const linked = variants.filter(v => v.erpProductId === upd.erpProductId)
    if (!linked.length) continue

    for (const variant of linked) {
      const newErpStock = calcVariantStock(upd.stock, upd.unit, variant.variantValue, variant.variantUnit)
      const currentErpStock = variant.erpStock ?? 0

      // M15: Only overwrite stock if no manual admin adjustment has been made.
      // A manual adjustment is detected when stock !== erpStock (last known ERP value).
      const hasManualOverride = variant.stock !== currentErpStock
      await db.productVariant.update({
        where: { id: variant.id },
        data: {
          erpStock: newErpStock,
          ...(hasManualOverride ? {} : { stock: newErpStock }),
        },
      })
      updated++
    }

    // Update erpStock on the parent product (for admin inventory view)
    const productId = linked[0].productId
    await db.product.update({
      where: { id: productId },
      data:  { erpStock: upd.stock, erpUnit: upd.unit },
    }).catch((e) => console.error('[StockWebhook] product erpStock update error:', e?.message))
  }

  // Also update variants without erpProductId using product.erpStock as fallback
  const updatedProductIds = [...new Set(variants.map(v => v.productId))]
  if (updatedProductIds.length > 0) {
    const products = await db.product.findMany({
      where: { id: { in: updatedProductIds } },
      select: { id: true, erpStock: true, erpUnit: true },
    })
    const unlinkedVariants = await db.productVariant.findMany({
      where: { productId: { in: updatedProductIds }, erpProductId: null },
      select: { id: true, productId: true, variantValue: true, variantUnit: true, stock: true, erpStock: true },
    })
    const productById = new Map(products.map(p => [p.id, p]))
    for (const v of unlinkedVariants) {
      const prod = productById.get(v.productId)
      if (!prod || !prod.erpStock) continue
      const newErpStock = calcVariantStock(
        Number(prod.erpStock),
        prod.erpUnit ?? 'ks',
        v.variantValue,
        v.variantUnit,
      )
      const currentErpStock = v.erpStock ?? 0
      const hasManualOverride = v.stock !== currentErpStock
      await db.productVariant.update({
        where: { id: v.id },
        data: {
          erpStock: newErpStock,
          ...(hasManualOverride ? {} : { stock: newErpStock }),
        },
      })
      updated++
    }
  }

  console.log(`[StockWebhook] Updated ${updated} variant(s) for erpProductIds=${erpProductIds.join(',')}`)
}
