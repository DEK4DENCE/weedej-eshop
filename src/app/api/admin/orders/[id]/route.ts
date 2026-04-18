import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { sendEmail } from "@/lib/email/send"
import { OrderShippedWithTracking } from "@/lib/email/templates/OrderShipped"
import { OrderCancelled } from "@/lib/email/templates/OrderCancelled"
import { OrderDelivered } from "@/lib/email/templates/OrderDelivered"
import { logAdminAction } from "@/lib/audit"
import React from "react"
import { z } from "zod"

// C3: Valid order state transitions — prevents illegal moves like DELIVERED → PAID
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:          ["PAID", "CANCELLED"],
  PAID:             ["PROCESSING", "CANCELLED", "REFUNDED"],
  PROCESSING:       ["PACKED", "SHIPPED", "CANCELLED", "REFUNDED"],
  PACKED:           ["SHIPPED", "CANCELLED"],
  SHIPPED:          ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED:        [],
  CANCELLED:        [],
  REFUNDED:         [],
}

const ALL_STATUSES = [
  "PENDING", "PAID", "PROCESSING", "PACKED", "SHIPPED",
  "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED",
] as const

const patchOrderSchema = z.object({
  status: z.enum(ALL_STATUSES),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  const rawBody = await req.json()
  const parsed = patchOrderSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body", issues: parsed.error.flatten() }, { status: 400 })
  }
  const { status } = parsed.data

  // C3: Validate state transition before touching the DB
  const current = await db.order.findUnique({ where: { id }, select: { status: true } })
  if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  const allowed = VALID_TRANSITIONS[current.status] ?? []
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Invalid transition: ${current.status} → ${status}` },
      { status: 400 }
    )
  }

  // Set timestamp fields on status transitions
  const extraData: Record<string, unknown> = {}
  if (status === "SHIPPED" && !extraData.shippedAt) extraData.shippedAt = new Date()
  if (status === "DELIVERED") extraData.deliveredAt = new Date()

  // For REFUNDED or CANCELLED-from-a-paid-state: issue Stripe refund BEFORE
  // the DB transaction so a Stripe failure aborts the flow without touching
  // order or inventory state.
  const paidStates = new Set(["PAID", "PROCESSING", "PACKED"])
  const needsRefund = status === "REFUNDED" || (status === "CANCELLED" && paidStates.has(current.status))
  if (needsRefund) {
    const orderForRefund = await db.order.findUnique({
      where: { id },
      select: { stripePaymentIntentId: true },
    })
    if (orderForRefund?.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({ payment_intent: orderForRefund.stripePaymentIntentId })
      } catch (refundErr: any) {
        if (refundErr?.code !== "charge_already_refunded") {
          const verb = status === "CANCELLED" ? "cancel paid" : "refund"
          return NextResponse.json({ error: `Cannot ${verb} order: Stripe refund failed — ${refundErr?.message}` }, { status: 400 })
        }
      }
    }
  }

  // Atomically update order status and all related stock movements so a partial
  // failure never leaves order state and inventory out of sync.
  let order: any
  try {
    order = await db.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status, ...extraData },
        include: {
          items: true,
          user: { select: { email: true, name: true } },
        },
      })

      if (status === "SHIPPED" || status === "DELIVERED") {
        for (const item of updated.items) {
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "SOLD",
              quantity: item.quantity,
              orderId: id,
              reason: `Order ${status.toLowerCase()}`,
            },
          })
        }
      } else if (status === "CANCELLED" || status === "REFUNDED") {
        const reason = status === "CANCELLED" ? "Order cancelled" : "Order refunded"
        for (const item of updated.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "RELEASED",
              quantity: item.quantity,
              orderId: id,
              reason,
            },
          })
        }
      }

      return updated
    })
  } catch (stockError) {
    console.error("Failed to update order status + stock:", stockError)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }

  // Send email notification to customer
  try {
    const customerEmail = order.user.email
    const customerName = order.user.name ?? customerEmail.split("@")[0]
    const orderNumber = (order as any).erpOrderNumber ?? order.id
    const displayNumber = (order as any).erpOrderNumber ?? `#${order.id.slice(-8).toUpperCase()}`

    if (status === "SHIPPED") {
      // Fetch shipping method estimatedDays from DB
      let estimatedDays: string | undefined
      try {
        const sm = await db.shippingMethod.findFirst({
          where: { isActive: true, price: { gt: 0 } },
          orderBy: { sortOrder: "asc" },
          select: { estimatedDays: true },
        })
        estimatedDays = sm?.estimatedDays ?? undefined
      } catch { /* non-fatal */ }

      // Fetch invoice PDF for attachment
      let invoicePdfBase64: string | null = (order as any).invoicePdfBase64 ?? null
      const invoiceUrl = (order as any).invoiceUrl as string | null
      if (!invoicePdfBase64 && invoiceUrl) {
        try {
          const apiKey = process.env.ERP_API_KEY
          if (apiKey) {
            const pdfRes = await fetch(invoiceUrl, {
              headers: { "X-API-Key": apiKey },
              signal: AbortSignal.timeout(8_000),
            })
            if (pdfRes.ok) {
              invoicePdfBase64 = Buffer.from(await pdfRes.arrayBuffer()).toString("base64")
              await db.order.update({ where: { id }, data: { invoicePdfBase64 } }).catch(() => {})
            }
          }
        } catch { /* non-fatal */ }
      }

      const invoiceFilename = (order as any).invoiceNumber
        ? `faktura-${(order as any).invoiceNumber}.pdf`
        : "faktura.pdf"

      await sendEmail({
        to: customerEmail,
        subject: `Vaše objednávka ${displayNumber} byla odeslána`,
        emailType: 'orderShipped',
        react: React.createElement(OrderShippedWithTracking, {
          name: customerName,
          orderNumber,
          items: order.items.map((i: any) => ({
            productName: i.productName,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
          })),
          totalAmount: order.totalAmount,
          deliveryType: order.deliveryType,
          invoiceNumber: (order as any).invoiceNumber ?? undefined,
          estimatedDays,
        }),
        attachments: invoicePdfBase64
          ? [{ filename: invoiceFilename, content: invoicePdfBase64, contentType: "application/pdf", encoding: "base64" }]
          : [],
      })
    } else if (status === "DELIVERED") {
      await sendEmail({
        to: customerEmail,
        subject: `Vaše objednávka ${displayNumber} byla doručena`,
        emailType: 'orderDelivered',
        react: React.createElement(OrderDelivered, {
          name: customerName,
          orderNumber,
          items: order.items.map((i: any) => ({
            productName: i.productName,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
          })),
          totalAmount: order.totalAmount,
        }),
      })
    } else if (status === "CANCELLED") {
      await sendEmail({
        to: customerEmail,
        subject: `Vaše objednávka ${displayNumber} byla zrušena`,
        emailType: 'orderCancelled',
        react: React.createElement(OrderCancelled, {
          name: customerName,
          orderNumber,
          items: order.items.map((i: any) => ({
            productName: i.productName,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          totalAmount: order.totalAmount,
        }),
      })
    }
  } catch (emailError) {
    console.error("Failed to send order status email:", emailError)
  }

  // H5: Log admin action for audit trail
  await logAdminAction({
    adminId:    session.user.id as string,
    action:     "UPDATE_ORDER_STATUS",
    entityType: "Order",
    entityId:   id,
    oldValue:   { status: current.status },
    newValue:   { status },
  }).catch((e: unknown) => console.error("[Audit] logAdminAction failed:", e))

  return NextResponse.json(order)
}
