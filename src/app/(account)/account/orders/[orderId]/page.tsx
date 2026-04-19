export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { OrderDetail } from "@/components/orders/OrderDetail"

interface Props {
  params: Promise<{ orderId: string }>
}

export const metadata = { title: "Detail objednávky — Weedej" }

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params
  const session = await auth()
  const userId = (session?.user as any)?.id as string | undefined
  if (!userId) redirect("/login")

  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { select: { name: true, imageUrls: true, slug: true } } },
          },
        },
      },
      address: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  })
  if (!order) notFound()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-playfair">Detail objednávky</h1>
      <OrderDetail order={order as any} />
    </div>
  )
}