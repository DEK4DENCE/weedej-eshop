import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email/send"
import { OrderShippedWithTracking } from "@/lib/email/templates/OrderShipped"
import { OrderCancelled } from "@/lib/email/templates/OrderCancelled"
import { OrderDelivered } from "@/lib/email/templates/OrderDelivered"
import { logAdminAction } from "@/lib/audit"
import React from "react"

// C3: Valid order state transitions — prevents illegal moves like DELIVERED → PAID
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:          ["PAID", "CANCELLED"],
  PAID:             ["PROCESSING", "CANCELLED"],
  PROCESSING:       ["PACKED", "SHIPPED", "CANCELLED"],
  PACKED:           ["SHIPPED", "CANCELLED"],
  SHIPPED:          ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED:        [],
  CANCELLED:        [],
  REFUNDED:         [],
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  const { status } = await req.json()

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

  const order = await db.order.update({
    where: { id },
    data: { status, ...extraData },
    include: {
      items: true,
      user: { select: { email: true, name: true } },
    },
  })

  // Handle stock transitions on status change
  try {
    if (status === "SHIPPED" || status === "DELIVERED") {
      await db.$transaction(
        order.items.map((item) =>
          db.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "SOLD",
              quantity: item.quantity,
              orderId: id,
              reason: `Order ${status.toLowerCase()}`,
            },
          })
        )
      )
    } else if (status === "CANCELLED") {
      await db.$transaction(
        order.items.flatMap((item) => [
          db.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          }),
          db.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "RELEASED",
              quantity: item.quantity,
              orderId: id,
              reason: "Order cancelled",
            },
          }),
        ])
      )
    } else if (status === "REFUNDED") {
      // Restore stock to each variant and create a RELEASED movement for audit trail
      await db.$transaction(
        order.items.flatMap((item) => [
          db.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          }),
          db.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: "RELEASED",
              quantity: item.quantity,
              orderId: id,
              reason: "Order refunded",
            },
          }),
        ])
      )
    }
  } catch (stockError) {
    console.error("Failed to update stock on order status change:", stockError)
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
          items: order.items.map((i) => ({
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
          items: order.items.map((i) => ({
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
          items: order.items.map((i) => ({
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
