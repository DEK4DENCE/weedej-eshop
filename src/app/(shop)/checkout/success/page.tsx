import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const metadata = { title: "Objednávka potvrzena — Weedej" }

/**
 * Fallback order creation — runs only if the Stripe webhook hasn't created the order yet.
 * Creates with status PAID so force-sync / cron can push it to ERP.
 * The Stripe webhook is the primary path; this is the safety net.
 */
async function ensureOrderExists(sessionId: string) {
  try {
    // Check if webhook already created the order
    const existing = await db.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true, erpOrderNumber: true },
    })
    if (existing) return existing

    // Webhook hasn't fired yet — create as fallback
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== "paid") return null

    const userId = session.metadata?.userId
    const itemsRaw = session.metadata?.items
    const deliveryType = (session.metadata?.deliveryType ?? "COURIER") as "COURIER" | "PICKUP_IN_STORE"
    const addressId = session.metadata?.addressId || null

    if (!userId || !itemsRaw) return null

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
        unitPrice:    Math.round(Number(variant?.price ?? 0) * 100),
      }
    })

    const totalAmount    = session.amount_total ?? 0
    const shippingAmount = session.shipping_cost?.amount_total ?? 0
    const subtotalAmount = totalAmount - shippingAmount

    // Create as PAID — cron / force-sync will push to ERP and move to PROCESSING
    const order = await db.order.create({
      data: {
        userId,
        addressId:             addressId || null,
        stripeSessionId:       sessionId,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        status:          "PAID",
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
      select: { id: true, erpOrderNumber: true },
    })

    // Clear cart
    try {
      await db.cartItem.deleteMany({ where: { cart: { userId } } })
    } catch {}

    return order
  } catch (e) {
    // Unique constraint = webhook already created it between our check and create
    const existing = await db.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true, erpOrderNumber: true },
    }).catch(() => null)
    return existing
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  const order = sessionId ? await ensureOrderExists(sessionId) : null
  const displayNumber = order?.erpOrderNumber ?? null

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <CheckCircle2 className="h-16 w-16 text-[#2E7D32] mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4 font-playfair text-[#1d1d1f]">Objednávka potvrzena!</h1>
      <p className="text-[#6e6e73] mb-8">
        Děkujeme za vaši objednávku. Potvrzovací e-mail s fakturou vám bude brzy odeslán.
      </p>
      {displayNumber ? (
        <p className="text-sm font-mono font-semibold text-[#2E7D32] mb-6">
          Číslo objednávky: {displayNumber}
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
