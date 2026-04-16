/**
 * POST /api/admin/erp/force-sync
 *
 * Admin-triggered ERP sync for orders stuck in pending_erp_sync or sync_failed.
 * Mirrors the cron logic but runnable on-demand from the admin panel.
 * Protected by admin session auth.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpConfig, syncOrderToErp } from "@/lib/erp"

export const dynamic = "force-dynamic"

const MAX_ATTEMPTS = 3

export async function POST() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const erpConfig = await getErpConfig()
  if (!erpConfig) {
    return NextResponse.json(
      { error: "ERP není nakonfigurováno. Jdi do Nastavení → Propojení s ERP a ulož URL + API klíč." },
      { status: 503 }
    )
  }

  // Find all orders that were never successfully synced
  const pending = await db.order.findMany({
    where: {
      erpSyncStatus: { in: ["pending_erp_sync", "sync_failed"] },
      erpSyncAttempts: { lt: MAX_ATTEMPTS * 2 }, // allow more retries via admin
    },
    include: {
      user:    { select: { id: true, name: true, email: true } },
      items:   true,
      address: true,
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  })

  let succeeded = 0
  let failed = 0
  const errors: string[] = []

  for (const order of pending) {
    try {
      const user = order.user
      const addr = order.address
      const items = order.items

      const streetLine = addr
        ? [addr.fullName, addr.line1, addr.line2].filter(Boolean).join(", ")
        : "Neuvedena"

      // Look up actual VAT rate per product for correct excl-VAT price calculation
      const variantIds = items.map((i: any) => i.variantId).filter(Boolean)
      const variantDataMap = new Map<string, { vatRate: number; variantValue: number | null; variantUnit: string | null }>()
      if (variantIds.length > 0) {
        const variants = await db.productVariant.findMany({
          where:  { id: { in: variantIds } },
          select: { id: true, variantValue: true, variantUnit: true, product: { select: { vatRate: true } } },
        })
        for (const v of variants) variantDataMap.set(v.id, {
          vatRate:      Number(v.product?.vatRate ?? 21),
          variantValue: v.variantValue ? Number(v.variantValue) : null,
          variantUnit:  v.variantUnit ?? null,
        })
      }

      const erpItems = items.map((item: any) => {
        const vd              = item.variantId ? (variantDataMap.get(item.variantId) ?? { vatRate: 21, variantValue: null, variantUnit: null }) : { vatRate: 21, variantValue: null, variantUnit: null }
        const vatRate         = vd.vatRate
        const unitPriceKc     = (item.unitPrice as number) / 100
        const priceExclPerPack = unitPriceKc / (1 + vatRate / 100)

        const physQty      = vd.variantValue && vd.variantValue > 0 && vd.variantUnit
          ? item.quantity * vd.variantValue
          : item.quantity
        const unit         = vd.variantValue && vd.variantValue > 0 && vd.variantUnit
          ? vd.variantUnit
          : 'ks'
        const unitPriceCzk = vd.variantValue && vd.variantValue > 0 && vd.variantUnit
          ? Math.round(priceExclPerPack / vd.variantValue * 100) / 100
          : Math.round(priceExclPerPack * 100) / 100

        return {
          name:         `${item.productName}${item.variantLabel ? " — " + item.variantLabel : ""}`,
          quantity:     physQty,
          unit,
          unitPriceCzk,
          vatRate,
        }
      })

      const syncResult = await syncOrderToErp({
        eshopOrderId:     order.id,
        items:            erpItems,
        customer: {
          name:  user?.name || user?.email || "Zákazník",
          email: user?.email || "",
          address: {
            street:  streetLine,
            city:    addr?.city       || "Neuvedeno",
            zip:     addr?.postalCode || "00000",
            country: addr?.country    || "CZ",
          },
        },
        totalCzk:         order.totalAmount / 100,
        paymentReference: order.stripePaymentIntentId ?? order.stripeSessionId ?? order.id,
        paidAt:           order.createdAt.toISOString(),
      }, erpConfig)

      await db.order.update({
        where: { id: order.id },
        data: {
          status:           "PROCESSING",
          erpSyncStatus:    "synced",
          erpOrderNumber:   syncResult.erpOrderNumber,
          invoiceNumber:    syncResult.invoiceNumber,
          invoiceUrl:       syncResult.invoicePdfUrl,
          erpSyncAttempts:  order.erpSyncAttempts + 1,
          erpSyncLastError: null,
        },
      })

      await db.erpSyncAttempt.create({
        data: { orderId: order.id, success: true },
      })

      succeeded++
      console.log(`[ForceSync] OK orderId=${order.id} erpOrderNumber=${syncResult.erpOrderNumber}`)
    } catch (err: any) {
      failed++
      const errMsg = err?.message ?? "Unknown error"
      errors.push(`Order ${order.id.slice(-8).toUpperCase()}: ${errMsg}`)

      await db.order.update({
        where: { id: order.id },
        data: {
          erpSyncAttempts:  order.erpSyncAttempts + 1,
          erpSyncLastError: errMsg,
          erpSyncStatus:    order.erpSyncAttempts + 1 >= MAX_ATTEMPTS * 2 ? "sync_failed" : "pending_erp_sync",
        },
      })

      await db.erpSyncAttempt.create({
        data: { orderId: order.id, success: false, error: errMsg },
      })

      console.error(`[ForceSync] FAIL orderId=${order.id}:`, errMsg)
    }
  }

  const message = pending.length === 0
    ? "Žádné čekající objednávky k synchronizaci"
    : `Sync dokončen: ${succeeded} úspěšně, ${failed} chyb (z ${pending.length} celkem)`

  return NextResponse.json({ message, succeeded, failed, total: pending.length, errors })
}
