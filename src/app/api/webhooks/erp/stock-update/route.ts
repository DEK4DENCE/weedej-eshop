/**
 * POST /api/webhooks/erp/stock-update
 *
 * Receives ERP → e-shop webhook after any InventoryItem creation
 * (receipt processed, delivery note processed, eshop order shipped).
 *
 * Payload: { productIds: string[] }  — list of affected ERP product IDs
 *
 * Fetches current stock from ERP for those products, recalculates
 * ProductVariant.stock using the same calcVariantStock() logic as the
 * manual sync route, and updates the DB.
 *
 * Signed with HMAC-SHA256 (ERP_WEBHOOK_SECRET). Returns 200 immediately
 * so the ERP caller is never blocked.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { getErpStock } from '@/lib/erp'

export const dynamic = 'force-dynamic'

// ─── HMAC verification ────────────────────────────────────────────────────────

function verifySignature(rawBody: string, sigHeader: string | null): boolean {
  const secret = process.env.ERP_WEBHOOK_SECRET
  if (!secret || !sigHeader) return false
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sigHeader, 'utf8'))
  } catch {
    return false
  }
}

// ─── Variant stock calculation (same logic as /api/admin/erp/sync) ────────────

function calcVariantStock(
  erpStock: number,
  erpProductUnit: string,
  variantValue: number | null | undefined,
  variantUnit: string | null | undefined,
): number {
  if (!variantValue || variantValue <= 0) return Math.max(0, Math.floor(erpStock))
  const effectiveUnit = variantUnit ?? erpProductUnit
  if (effectiveUnit !== erpProductUnit) return 0
  return Math.max(0, Math.floor(erpStock / variantValue))
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const sigHeader = req.headers.get('x-erp-signature')

  if (!verifySignature(rawBody, sigHeader)) {
    console.warn('[StockWebhook] Invalid or missing HMAC signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: { productIds?: unknown }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const productIds = Array.isArray(payload.productIds) ? payload.productIds.filter((id): id is string => typeof id === 'string') : []
  if (productIds.length === 0) {
    return NextResponse.json({ received: true, updated: 0 })
  }

  // Respond 200 immediately — do the work async so ERP is never blocked
  processStockUpdate(productIds).catch(err =>
    console.error('[StockWebhook] processStockUpdate error:', err?.message)
  )

  return NextResponse.json({ received: true })
}

async function processStockUpdate(erpProductIds: string[]): Promise<void> {
  try {
    // Fetch current stock from ERP for the affected products
    const erpItems = await getErpStock(erpProductIds)
    if (!erpItems.length) return

    const erpMap = new Map(erpItems.map(p => [p.id, p]))

    // Load all e-shop variants linked to these ERP products
    const variants = await db.productVariant.findMany({
      where:  { erpProductId: { in: erpProductIds } },
      select: { id: true, erpProductId: true, variantValue: true, variantUnit: true, productId: true },
    })

    let updated = 0

    for (const variant of variants) {
      const erp = erpMap.get(variant.erpProductId!)
      if (!erp) continue

      const newStock = calcVariantStock(erp.stock, erp.unit, variant.variantValue, variant.variantUnit)

      await db.productVariant.update({
        where: { id: variant.id },
        data:  { stock: newStock },
      })
      updated++
    }

    // Also update erpStock on the parent product (for admin inventory view)
    const productIds = [...new Set(variants.map(v => v.productId))]
    for (const productId of productIds) {
      const variant = variants.find(v => v.productId === productId)
      if (!variant) continue
      const erp = erpMap.get(variant.erpProductId!)
      if (!erp) continue
      await db.product.update({
        where: { id: productId },
        data:  { erpStock: erp.stock, erpUnit: erp.unit },
      }).catch(() => {})
    }

    console.log(`[StockWebhook] Updated stock for ${updated} variant(s) from ERP productIds=${erpProductIds.join(',')}`)
  } catch (err: any) {
    console.error('[StockWebhook] Failed to process stock update:', err?.message)
  }
}
