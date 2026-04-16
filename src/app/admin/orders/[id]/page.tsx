export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils/formatPrice"
import { AdminOrderStatusClient } from "@/components/admin/AdminOrderStatusClient"
import { CheckCircle2, Circle, Clock } from "lucide-react"

interface Props { params: Promise<{ id: string }> }

export const metadata = { title: "Order Detail — Admin" }

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Prague',
  }).format(new Date(dateStr))
}

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

  const orderHeading = order.erpOrderNumber ?? `#${order.id.slice(-8).toUpperCase()}`
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'
  const resolvedPaidAt = (order as any).paidAt ?? (order.status !== 'PENDING' ? order.createdAt?.toISOString() : null)

  const timelineSteps = [
    { key: 'ordered',   label: 'Objednáno',  timestamp: order.createdAt?.toISOString() ?? null },
    { key: 'paid',      label: 'Zaplaceno',  timestamp: resolvedPaidAt ? new Date(resolvedPaidAt).toISOString() : null },
    { key: 'shipped',   label: 'Odesláno',   timestamp: (order as any).shippedAt ? new Date((order as any).shippedAt).toISOString() : null },
    { key: 'delivered', label: 'Doručeno',   timestamp: (order as any).deliveredAt ? new Date((order as any).deliveredAt).toISOString() : null },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold font-playfair">Objednávka {orderHeading}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Zákazník</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{order.user.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{order.user.email}</p>
            {order.notes && <p className="text-sm text-muted-foreground mt-2">{order.notes}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Status &amp; ERP</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <AdminOrderStatusClient currentStatus={order.status} />
            {order.erpOrderNumber && (
              <p className="text-sm">
                <span className="text-muted-foreground">ERP číslo: </span>
                <span className="font-mono font-semibold text-emerald-600">{order.erpOrderNumber}</span>
              </p>
            )}
            {order.invoiceNumber && (
              <p className="text-sm">
                <span className="text-muted-foreground">Faktura: </span>
                <span className="font-mono">{order.invoiceNumber}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order lifecycle timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-emerald-500" />
            Průběh objednávky
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border/40" />
            <div className="space-y-5">
              {timelineSteps.map((step) => {
                const done = !!step.timestamp
                return (
                  <div key={step.key} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-0 top-0.5">
                      {done
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        : <Circle className={`w-6 h-6 ${isCancelled ? 'text-red-400/50' : 'text-muted-foreground/30'}`} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                        {step.label}
                      </p>
                      {done && step.timestamp ? (
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(step.timestamp)}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground/40 mt-0.5">
                          {isCancelled ? '—' : 'Čeká se…'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
              {isCancelled && (
                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-0 top-0.5">
                    <CheckCircle2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-500">
                      {order.status === 'REFUNDED' ? 'Vráceno' : 'Stornováno'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Položky</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.variant.product.name} — {item.variant.name} × {item.quantity}</span>
              <span className="font-medium">{formatPrice((item.unitPrice * item.quantity) / 100)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border/40 flex justify-between font-semibold">
            <span>Celkem</span>
            <span>{formatPrice(order.totalAmount / 100)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}