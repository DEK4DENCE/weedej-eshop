export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils/formatPrice"
import { AdminOrderStatusClient } from "@/components/admin/AdminOrderStatusClient"

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: "Order Detail — Admin" }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { variant: { include: { product: { select: { name: true } } } } } },
    },
  })
  if (!order) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold font-playfair">Order #{order.id.slice(-8).toUpperCase()}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{order.user.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
            {order.notes && <p className="text-sm text-muted-foreground mt-2">{order.notes}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Badge>{order.status}</Badge>
            <AdminOrderStatusClient orderId={order.id} currentStatus={order.status} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.variant.product.name} — {item.variant.name} × {item.quantity}</span>
              <span className="font-medium">{formatPrice((item.unitPrice * item.quantity) / 100)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border/40 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount / 100)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}