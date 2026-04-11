import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email/send"
import { OrderConfirmation } from "@/lib/email/templates/OrderConfirmation"
import { NewOrderNotification } from "@/lib/email/templates/NewOrderNotification"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const itemsRaw = session.metadata?.items
    const deliveryType = (session.metadata?.deliveryType ?? "COURIER") as "COURIER" | "PICKUP_IN_STORE"
    const addressId = session.metadata?.addressId || null

    if (!userId || !itemsRaw) return NextResponse.json({ received: true })

    // Compact format: [{v: variantId, q: quantity}]
    const rawItems: { v: string; q: number }[] = JSON.parse(itemsRaw)

    // Resolve full variant + product info from DB
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
        stripeSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        status: "PROCESSING",
        deliveryType,
        currency: (session.currency ?? "czk").toUpperCase(),
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

    // Send order confirmation email
    try {
      const user = await db.user.findUnique({ where: { id: userId } })
      let shippingAddress: { fullName: string; line1: string; city: string; postalCode: string; country: string } | undefined

      if (addressId) {
        const addr = await db.address.findUnique({ where: { id: addressId } })
        if (addr) {
          shippingAddress = {
            fullName: addr.fullName,
            line1: addr.line1,
            city: addr.city,
            postalCode: addr.postalCode,
            country: addr.country,
          }
        }
      }

      if (user?.email) {
        const firstName = user.name?.split(" ")[0] ?? "there"
        await sendEmail({
          to: user.email,
          subject: `Order confirmed — #${order.id.slice(-8).toUpperCase()}`,
          react: OrderConfirmation({
            name: firstName,
            orderNumber: order.id,
            items,
            subtotalAmount,
            shippingAmount,
            totalAmount,
            deliveryType,
            shippingAddress,
          }),
        })
      }

      // Admin notification email
      const adminEmailSetting = await db.setting.findUnique({ where: { key: "orderNotificationEmail" } })
      const adminEmail = adminEmailSetting?.value ?? process.env.ADMIN_ORDER_EMAIL
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `New Order #${order.id.slice(-8).toUpperCase()} — ${user?.name ?? user?.email ?? "Customer"}`,
          react: NewOrderNotification({
            orderNumber: order.id,
            customerName: user?.name ?? user?.email ?? "Unknown",
            customerEmail: user?.email ?? "",
            items,
            subtotalAmount,
            shippingAmount,
            totalAmount,
            deliveryType,
            shippingAddress,
          }),
        })
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError)
    }

    // Deduct stock and log movements for each order item
    try {
      const createdOrder = await db.order.findUnique({ where: { id: order.id }, include: { items: true } })
      if (createdOrder) {
        for (const item of createdOrder.items) {
          await db.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
          await db.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "RESERVED",
              quantity: item.quantity,
              orderId: order.id,
              reason: "Order paid",
            },
          })
        }
      }
    } catch (stockError) {
      console.error("Failed to update stock:", stockError)
    }

    // Clear user's cart after successful order
    try {
      await db.cartItem.deleteMany({ where: { cart: { userId } } })
    } catch (e) {
      console.error("Failed to clear cart:", e)
    }
  }

  return NextResponse.json({ received: true })
}
