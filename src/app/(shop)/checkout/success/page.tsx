/**
 * Checkout success page — server-side ERP sync
 *
 * Stripe redirects here after payment. This page:
 *   1. Creates the order in DB (if webhook hasn't done it yet)
 *   2. Syncs to ERP immediately → gets ESH number
 *   3. Sends confirmation email with invoice URL
 *   4. Shows ESH number to customer
 *
 * Stripe webhook is a bonus — if it fires, it skips (order already synced).
 * All critical work happens here, no webhook dependency.
 */

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { getErpConfig, syncOrderToErp } from "@/lib/erp"
import { sendEmail } from "@/lib/email/send"
import { OrderConfirmationWithInvoice, OrderConfirmationAck } from "@/lib/email/templates/OrderConfirmation"
import { NewOrderNotification } from "@/lib/email/templates/NewOrderNotification"

export const dynamic = "force-dynamic"
export const metadata = { title: "Objednávka potvrzena — Weedej" }

async function processOrder(sessionId: string): Promise<{ erpOrderNumber: string | null; orderId: string } | null> {
  try {
    // ── Already fully processed? Return immediately ────────────────────────
    const existing = await db.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true, erpOrderNumber: true, erpSyncStatus: true },
    })
    if (existing?.erpSyncStatus === "synced") {
      return { erpOrderNumber: existing.erpOrderNumber, orderId: existing.id }
    }

    // ── Load Stripe session ────────────────────────────────────────────────
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== "paid") return null

    const userId       = session.metadata?.userId
    const itemsRaw     = session.metadata?.items
    const deliveryType = (session.metadata?.deliveryType ?? "COURIER") as "COURIER" | "PICKUP_IN_STORE"
    const addressId    = session.metadata?.addressId || null
    if (!userId || !itemsRaw) return null

    // ── Resolve variants + build item list ────────────────────────────────
    const rawItems: { v: string; q: number }[] = JSON.parse(itemsRaw)
    const variants = await db.productVariant.findMany({
      where: { id: { in: rawItems.map((i) => i.v) } },
      include: { product: true },
    })
    const variantMap = new Map(variants.map((v) => [v.id, v]))
    const items = rawItems.map((i) => {
      const variant = variantMap.get(i.v)
      return {
        variantId:    i.v,
        productId:    variant?.productId ?? "",
        productName:  variant?.product?.name ?? "Product",
        variantLabel: variant?.name ?? "",
        quantity:     i.q,
        unitPrice:    Math.round(Number(variant?.price ?? 0) * 100), // haléře
        erpProductId: variant?.erpProductId ?? null,
        variantValue: variant?.variantValue ?? null,
        variantUnit:  variant?.variantUnit  ?? null,
        // C2: use product-level VAT rate instead of hardcoded 21
        vatRate:      Number(variant?.product?.vatRate ?? 21),
      }
    })

    const totalAmount    = session.amount_total ?? 0
    const shippingAmount = session.shipping_cost?.amount_total ?? 0
    const subtotalAmount = totalAmount - shippingAmount

    // ── Create order if not already in DB ─────────────────────────────────
    let order: { id: string; erpOrderNumber: string | null; erpSyncStatus: string }
    if (existing) {
      order = existing
    } else {
      try {
        order = await db.order.create({
          data: {
            userId,
            addressId:             addressId || null,
            stripeSessionId:       sessionId,
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
            status:          "PAID",
            paidAt:          new Date(),
            erpSyncStatus:   "pending_erp_sync",
            deliveryType,
            currency:        (session.currency ?? "czk").toUpperCase(),
            totalAmount,
            subtotalAmount,
            shippingAmount,
            items: {
              create: items.map((item) => ({
                productId:    item.productId,
                variantId:    item.variantId,
                productName:  item.productName,
                variantLabel: item.variantLabel,
                quantity:     item.quantity,
                unitPrice:    item.unitPrice,
              })),
            },
          },
          select: { id: true, erpOrderNumber: true, erpSyncStatus: true },
        })
        // Clear cart after creating order
        await db.cartItem.deleteMany({ where: { cart: { userId } } }).catch((e) => console.error('[Silent error]', e))
      } catch {
        // Race condition: webhook created it between our check and create
        const raceOrder = await db.order.findUnique({
          where: { stripeSessionId: sessionId },
          select: { id: true, erpOrderNumber: true, erpSyncStatus: true },
        })
        if (!raceOrder) return null
        if (raceOrder.erpSyncStatus === "synced") {
          return { erpOrderNumber: raceOrder.erpOrderNumber, orderId: raceOrder.id }
        }
        order = raceOrder
      }
    }

    // ── ERP sync ───────────────────────────────────────────────────────────
    const erpConfig = await getErpConfig()
    if (!erpConfig) {
      console.warn(`[Success] ERP not configured — order ${order.id} stays pending`)
      return { erpOrderNumber: null, orderId: order.id }
    }

    const user = await db.user.findUnique({
      where:  { id: userId },
      select: { id: true, name: true, email: true },
    })
    const addr = addressId ? await db.address.findUnique({ where: { id: addressId } }) : null

    const streetLine = addr ? [addr.fullName, addr.line1, addr.line2].filter(Boolean).join(", ") : "Neuvedena"
    const paymentRef = typeof session.payment_intent === "string" ? session.payment_intent : sessionId

    const erpItems = items.map((item) => {
      // C2: use per-product vatRate instead of hardcoded 21%
      const vatRate          = item.vatRate
      const unitPriceKc      = item.unitPrice / 100
      const unitPriceExclVat = Math.round((unitPriceKc / (1 + vatRate / 100)) * 100) / 100
      const erpName = item.variantLabel ? `${item.productName} — ${item.variantLabel}` : item.productName
      return {
        sku:          item.erpProductId ?? undefined,
        name:         erpName,
        quantity:     item.quantity,
        unit:         'ks',
        variantValue: (item.variantValue as number | null) ?? undefined,
        variantUnit:  (item.variantUnit  as string | null) ?? undefined,
        unitPriceCzk: unitPriceExclVat,
        vatRate,
      }
    })

    // Shipping as a line item so ERP totals match the Stripe charge
    // Shipping VAT is always 21% per Czech tax law
    const shippingCzk = shippingAmount / 100
    if (shippingCzk > 0) {
      erpItems.push({
        sku:          undefined,
        name:         'Doprava',
        quantity:     1,
        unit:         'ks',
        variantValue: undefined,
        variantUnit:  undefined,
        unitPriceCzk: Math.round(shippingCzk / 1.21 * 100) / 100,
        vatRate:      21,
      })
    }

    let erpOrderNumber: string | null = null
    let invoiceNumber:  string | null = null
    let invoicePdfUrl:  string | null = null

    try {
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
        totalCzk:         totalAmount / 100,
        paymentReference: paymentRef,
        paidAt:           new Date().toISOString(),
      }, erpConfig)

      erpOrderNumber = syncResult.erpOrderNumber
      invoiceNumber  = syncResult.invoiceNumber
      invoicePdfUrl  = syncResult.invoicePdfUrl

      // Update order with ESH number
      await db.order.update({
        where: { id: order.id },
        data: {
          status:           "PROCESSING",
          erpSyncStatus:    "synced",
          erpOrderNumber,
          invoiceNumber,
          invoiceUrl:       invoicePdfUrl,
          erpSyncAttempts:  1,
          erpSyncLastError: null,
        },
      })
      await db.erpSyncAttempt.create({ data: { orderId: order.id, success: true } })

      console.log(`[Success] ERP sync OK orderId=${order.id} erpOrderNumber=${erpOrderNumber}`)
      // Stock deduction is the webhook's responsibility (C1).
      // The success page never deducts stock — the webhook is the authoritative path.
    } catch (erpErr: any) {
      console.error(`[Success] ERP sync failed for orderId=${order.id}:`, erpErr?.message)
      await db.order.update({
        where: { id: order.id },
        data: { erpSyncAttempts: 1, erpSyncLastError: erpErr?.message ?? "Unknown error" },
      }).catch((e) => console.error('[Silent error]', e))
      await db.erpSyncAttempt.create({ data: { orderId: order.id, success: false, error: erpErr?.message } }).catch((e) => console.error('[Silent error]', e))
    }

    // ── Send confirmation email (H12: after ERP sync; H13: emailSent guard) ──
    // Re-read emailSent from DB to avoid duplicate sends if webhook already fired.
    const freshOrderForEmail = await db.order.findUnique({
      where:  { id: order.id },
      select: { emailSent: true },
    })
    if (user?.email && !freshOrderForEmail?.emailSent) {
      try {
        const firstName    = user.name?.split(" ")[0] ?? "zákazníku"
        const shippingAddr = addr
          ? { fullName: addr.fullName, line1: addr.line1, city: addr.city, postalCode: addr.postalCode, country: addr.country }
          : undefined

        if (erpOrderNumber) {
          await sendEmail({
            to:      user.email,
            subject: `Potvrzení objednávky ${erpOrderNumber} — Weedej`,
            react:   OrderConfirmationWithInvoice({
              name:            firstName,
              orderNumber:     erpOrderNumber,
              items:           items.map((i) => ({ productName: i.productName, variantLabel: i.variantLabel, quantity: i.quantity, unitPrice: i.unitPrice })),
              subtotalAmount,
              shippingAmount,
              totalAmount,
              deliveryType,
              shippingAddress: shippingAddr,
              invoiceNumber:   invoiceNumber ?? undefined,
            }),
          })
        } else {
          await sendEmail({
            to:      user.email,
            subject: "Přijali jsme vaši objednávku — Weedej",
            react:   OrderConfirmationAck({
              name:            firstName,
              internalOrderId: order.id,
              items:           items.map((i) => ({ productName: i.productName, variantLabel: i.variantLabel, quantity: i.quantity, unitPrice: i.unitPrice })),
              subtotalAmount,
              shippingAmount,
              totalAmount,
              deliveryType,
              shippingAddress: shippingAddr,
            }),
          })
        }
        // Mark email sent atomically to block duplicate from webhook (H13)
        await db.order.update({ where: { id: order.id }, data: { emailSent: true } }).catch(() => {})
      } catch (emailErr: any) {
        console.error(`[Success] Email failed for orderId=${order.id}:`, emailErr?.message)
      }
    }

    // ── Admin notification ─────────────────────────────────────────────────
    try {
      const adminRow   = await db.setting.findUnique({ where: { key: "orderNotificationEmail" } })
      const adminEmail = adminRow?.value ?? process.env.ADMIN_ORDER_EMAIL
      const user2      = user  // already loaded above
      if (adminEmail) {
        await sendEmail({
          to:      adminEmail,
          subject: `Nová objednávka ${erpOrderNumber ?? order.id.slice(-8).toUpperCase()} — Weedej`,
          react:   NewOrderNotification({
            orderNumber:    erpOrderNumber ?? order.id,
            customerName:   user2?.name ?? user2?.email ?? "Zákazník",
            customerEmail:  user2?.email ?? "",
            items:          items.map((i) => ({ productName: i.productName, variantLabel: i.variantLabel, quantity: i.quantity, unitPrice: i.unitPrice })),
            subtotalAmount,
            shippingAmount,
            totalAmount,
            deliveryType,
            shippingAddress: addr
              ? { fullName: addr.fullName, line1: addr.line1, city: addr.city, postalCode: addr.postalCode, country: addr.country }
              : undefined,
          }),
        })
      }
    } catch {}

    return { erpOrderNumber, orderId: order.id }
  } catch (e) {
    console.error("[Success] processOrder error:", e)
    return null
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params    = await searchParams
  const sessionId = params.session_id

  const result       = sessionId ? await processOrder(sessionId) : null
  const erpNumber    = result?.erpOrderNumber ?? null

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <CheckCircle2 className="h-16 w-16 text-[#2E7D32] mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4 font-playfair text-[#1d1d1f]">Objednávka potvrzena!</h1>
      <p className="text-[#6e6e73] mb-8">
        Děkujeme za vaši objednávku. Potvrzovací e-mail s fakturou byl odeslán na váš e-mail.
      </p>
      {erpNumber ? (
        <p className="text-sm font-mono font-semibold text-[#2E7D32] mb-6">
          Číslo objednávky: {erpNumber}
        </p>
      ) : (
        <p className="text-sm text-[#6e6e73] mb-6">
          Číslo objednávky vám přijde e-mailem po zpracování platby.
        </p>
      )}
      <div className="flex gap-4 justify-center">
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Zobrazit objednávky
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center border border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/10 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Pokračovat v nákupu
        </Link>
      </div>
    </div>
  )
}
