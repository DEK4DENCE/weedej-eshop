export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { OrderDetail } from "@/components/orders/OrderDetail"

interface Props {
  params: Promise<{ orderId: string }>
}

export const metadata = { title: "Order Detail — Weedejna" }

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params
  const session = await auth()
  const order = await db.order.findFirst({
    where: { id: orderId, userId: (session!.user as any).id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { select: { name: true, imageUrls: true, slug: true } } },
          },
        },
      },
    },
  })
  if (!order) notFound()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-playfair">Order Details</h1>
      <OrderDetail order={order as any} />
    </div>
  )
}