import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email/send"
import { OrderShippedWithTracking } from "@/lib/email/templates/OrderShipped"
import { OrderCancelled } from "@/lib/email/templates/OrderCancelled"
import React from "react"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const { status } = await req.json()

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
      for (const item of order.items) {
        await db.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: "SOLD",
            quantity: item.quantity,
            orderId: id,
            reason: `Order ${status.toLowerCase()}`,
          },
        })
      }
    } else if (status === "CANCELLED") {
      for (const item of order.items) {
        await db.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })
        await db.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: "RELEASED",
            quantity: item.quantity,
            orderId: id,
            reason: "Order cancelled",
          },
        })
      }
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
    } else if (status === "CANCELLED") {
      await sendEmail({
        to: customerEmail,
        subject: `Vaše objednávka ${displayNumber} byla zrušena`,
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

  return NextResponse.json(order)
}
