export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { OrderCard } from "@/components/orders/OrderCard"

export const metadata = { title: "Orders — Weedej" }

export default async function OrdersPage() {
  const session = await auth()
  const orders = await db.order.findMany({
    where: { userId: (session!.user as any).id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: { select: { name: true, imageUrls: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-playfair">Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order as any} />
          ))}
        </div>
      )}
    </div>
  )
}