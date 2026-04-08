import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email/send"
import { OrderConfirmation } from "@/lib/email/templates/OrderConfirmation"
import { NewOrderNotification } from "@/lib/email/templates/NewOrderNotification"

export const dynamic = "force-dynamic"
export const metadata = { title: "Order Confirmed — Weedej" }

async function ensureOrderCreated(sessionId: string) {
  try {
    // Check if order already exists (webhook may have already created it)
    const existing = await db.order.findUnique({ where: { stripeSessionId: sessionId } })
    if (existing) return existing

    // Retrieve session from Stripe and create order as fallback
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
        variantId: i.v,
        productId: variant?.productId ?? "",
        productName: variant?.product?.name ?? "Product",
        variantLabel: variant?.name ?? "",
        quantity: i.q,
        unitPrice: Math.round(Number(variant?.price ?? 0) * 100),
      }
    })

    const totalAmount = session.amount_total ?? 0
    const shippingAmount = session.shipping_cost?.amount_total ?? 0
    const subtotalAmount = totalAmount - shippingAmount

    const order = await db.order.create({
      data: {
        userId,
        addressId: addressId || null,
        stripeSessionId: sessionId,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        status: "PROCESSING",
        deliveryType,
        totalAmount,
        subtotalAmount,
        shippingAmount,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantLabel: item.variantLabel,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })

    // Send buyer confirmation email
    try {
      const user = await db.user.findUnique({ where: { id: userId } })
      let shippingAddress: { fullName: string; line1: string; city: string; postalCode: string; country: string } | undefined
      if (addressId) {
        const addr = await db.address.findUnique({ where: { id: addressId } })
        if (addr) shippingAddress = { fullName: addr.fullName, line1: addr.line1, city: addr.city, postalCode: addr.postalCode, country: addr.country }
      }
      if (user?.email) {
        const firstName = user.name?.split(" ")[0] ?? "there"
        await sendEmail({
          to: user.email,
          subject: `Order confirmed — #${order.id.slice(-8).toUpperCase()}`,
          react: OrderConfirmation({ name: firstName, orderNumber: order.id, items, subtotalAmount, shippingAmount, totalAmount, deliveryType, shippingAddress }),
        })
      }

      // Send admin notification email
      const adminEmailSetting = await db.setting.findUnique({ where: { key: "orderNotificationEmail" } })
      const adminEmail = adminEmailSetting?.value ?? process.env.ADMIN_ORDER_EMAIL
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `New Order #${order.id.slice(-8).toUpperCase()} — ${user?.name ?? user?.email ?? "Customer"}`,
          react: NewOrderNotification({ orderNumber: order.id, customerName: user?.name ?? user?.email ?? "Unknown", customerEmail: user?.email ?? "", items, subtotalAmount, shippingAmount, totalAmount, deliveryType, shippingAddress }),
        })
      }
    } catch (e) {
      console.error("Email error in success page:", e)
    }

    // Clear user's cart
    try {
      await db.cartItem.deleteMany({ where: { cart: { userId } } })
    } catch (e) {
      console.error("Failed to clear cart:", e)
    }

    return order
  } catch (e) {
    console.error("ensureOrderCreated error:", e)
    return null
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const order = params.session_id ? await ensureOrderCreated(params.session_id) : null
  const orderRef = order ? order.id.slice(-8).toUpperCase() : params.session_id?.slice(-8).toUpperCase()

  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-lg">
      <CheckCircle2 className="h-16 w-16 text-[#2E7D32] mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4 font-playfair text-[#1d1d1f]">Objednávka potvrzena!</h1>
      <p className="text-[#6e6e73] mb-8">
        Děkujeme za vaši objednávku. Potvrzovací e-mail vám bude brzy odeslán.
      </p>
      {orderRef && (
        <p className="text-xs text-[#6e6e73] mb-6">
          Číslo objednávky: {orderRef}
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
