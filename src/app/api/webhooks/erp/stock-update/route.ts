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
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ─── HMAC verification ────────────────────────────────────────────────────────

function verifySignature(rawBody: string, sigHeader: string | null): boolean {
  const secret = process.env.ERP_WEBHOOK_SECRET
  if (!secret || !sigHeader) return false
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sigHeader, 'utf8'))
  } catch { return false }
}

// ─── Variant stock calculation (mirrors /api/admin/erp/sync) ─────────────────

function calcVariantStock(
  erpStock: number,
  erpUnit: string,
  variantValue: number | null | undefined,
  variantUnit: string | null | undefined,
): number {
  if (!variantValue || variantValue <= 0) return Math.max(0, Math.floor(erpStock))
  const effectiveUnit = variantUnit ?? erpUnit
  if (effectiveUnit !== erpUnit) return 0
  return Math.max(0, Math.floor(erpStock / variantValue))
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody   = await req.text()
  const sigHeader = req.headers.get('x-erp-signature')

  if (!verifySignature(rawBody, sigHeader)) {
    console.warn('[StockWebhook] Invalid or missing HMAC signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: { products?: unknown }
  try { payload = JSON.parse(rawBody) }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const products = Array.isArray(payload.products)
    ? (payload.products as any[]).filter(
        (p): p is { erpProductId: string; stock: number; unit: string } =>
          typeof p?.erpProductId === 'string' && typeof p?.stock === 'number'
      )
    : []

  if (products.length === 0) {
    return NextResponse.json({ received: true, updated: 0 })
  }

  // Respond 200 immediately — writes happen async so ERP is never blocked
  applyStockUpdate(products).catch(err =>
    console.error('[StockWebhook] applyStockUpdate error:', err?.message)
  )

  return NextResponse.json({ received: true })
}

// ─── Async writer ─────────────────────────────────────────────────────────────

async function applyStockUpdate(
  updates: { erpProductId: string; stock: number; unit: string }[]
): Promise<void> {
  const erpProductIds = updates.map(u => u.erpProductId)

  // Load all e-shop variants linked to these ERP products
  const variants = await db.productVariant.findMany({
    where:  { erpProductId: { in: erpProductIds } },
    select: { id: true, erpProductId: true, variantValue: true, variantUnit: true, productId: true },
  })

  let updated = 0

  for (const upd of updates) {
    const linked = variants.filter(v => v.erpProductId === upd.erpProductId)
    if (!linked.length) continue

    for (const variant of linked) {
      const newStock = calcVariantStock(upd.stock, upd.unit, variant.variantValue, variant.variantUnit)
      await db.productVariant.update({
        where: { id: variant.id },
        data:  { stock: newStock },
      })
      updated++
    }

    // Update erpStock on the parent product (for admin inventory view)
    const productId = linked[0].productId
    await db.product.update({
      where: { id: productId },
      data:  { erpStock: upd.stock, erpUnit: upd.unit },
    }).catch((e) => console.error('[Silent error]', e))
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
      select: { id: true, productId: true, variantValue: true, variantUnit: true },
    })
    const productById = new Map(products.map(p => [p.id, p]))
    for (const v of unlinkedVariants) {
      const prod = productById.get(v.productId)
      if (!prod || !prod.erpStock) continue
      const newStock = calcVariantStock(
        Number(prod.erpStock),
        prod.erpUnit ?? 'ks',
        v.variantValue,
        v.variantUnit,
      )
      await db.productVariant.update({ where: { id: v.id }, data: { stock: newStock } })
      updated++
    }
  }

  console.log(`[StockWebhook] Updated ${updated} variant(s) for erpProductIds=${erpProductIds.join(',')}`)
}
