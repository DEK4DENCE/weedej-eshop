import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email/send"
import { OrderShipped } from "@/lib/email/templates/OrderShipped"
import { OrderCancelled } from "@/lib/email/templates/OrderCancelled"
import React from "react"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const { status } = await req.json()

  const order = await db.order.update({
    where: { id },
    data: { status },
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
    const orderNumber = order.id

    if (status === "SHIPPED") {
      await sendEmail({
        to: customerEmail,
        subject: `Vaše objednávka #${orderNumber.slice(-8).toUpperCase()} byla odeslána`,
        react: React.createElement(OrderShipped, {
          name: customerName,
          orderNumber,
          items: order.items.map((i) => ({
            productName: i.productName,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
          })),
          totalAmount: order.totalAmount,
          deliveryType: order.deliveryType,
        }),
      })
    } else if (status === "CANCELLED") {
      await sendEmail({
        to: customerEmail,
        subject: `Vaše objednávka #${orderNumber.slice(-8).toUpperCase()} byla zrušena`,
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
