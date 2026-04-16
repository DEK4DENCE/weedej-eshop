import Link from 'next/link'
import Image from 'next/image'
import { Package, CheckCircle2, Circle } from 'lucide-react'
import { Order } from '@/types/order'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderCardProps {
  order: Order
}

function formatPrice(cents: number, currency: string = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Prague',
  }).format(new Date(dateStr))
}

function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Prague',
  }).format(new Date(dateStr))
}

interface TimelineStep {
  label: string
  timestamp: string | null | undefined
}

function CompactTimeline({ createdAt, paidAt, shippedAt, deliveredAt, status }: {
  createdAt: string
  paidAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  status: string
}) {
  const resolvedPaidAt = paidAt ?? (status !== 'PENDING' ? createdAt : null)

  const steps: TimelineStep[] = [
    { label: 'Objednáno', timestamp: createdAt },
    { label: 'Zaplaceno', timestamp: resolvedPaidAt },
    { label: 'Odesláno',  timestamp: shippedAt },
    { label: 'Doručeno',  timestamp: deliveredAt },
  ]

  return (
    <div className="flex items-start gap-0 mt-4">
      {steps.map((step, i) => {
        const done = !!step.timestamp
        const isLast = i === steps.length - 1
        return (
          <div key={step.label} className="flex items-center flex-1 min-w-0">
            {/* Step */}
            <div className="flex flex-col items-center flex-shrink-0">
              {done
                ? <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                : <Circle className="w-4 h-4 text-[#DEE2E6]" />
              }
              <p className={`text-[10px] mt-1 font-medium whitespace-nowrap ${done ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}`}>
                {step.label}
              </p>
              {done && step.timestamp && (
                <p className="text-[9px] text-[#6e6e73] whitespace-nowrap">{formatTime(step.timestamp)}</p>
              )}
            </div>
            {/* Connector */}
            {!isLast && (
              <div className={`h-px flex-1 mx-1 mb-5 ${done ? 'bg-[#2E7D32]/40' : 'bg-[#DEE2E6]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const thumbnailItems = order.items.slice(0, 3)

  const erpNum = (order as any).erpOrderNumber as string | null | undefined
  const displayNumber = erpNum
    ? erpNum.replace(/^ESH/i, '')
    : order.id.slice(-8).toUpperCase()

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="block bg-white border border-[#DEE2E6] rounded-2xl p-6 hover:border-[#2E7D32]/50 hover:shadow-[0_4px_20px_rgba(46,125,50,0.10)] transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm font-semibold text-[#1d1d1f]">
              #{displayNumber}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>

          <p className="text-xs text-[#6e6e73] mb-2">
            Zadáno {formatDate(order.createdAt)}
          </p>

          {/* Compact timeline */}
          <CompactTimeline
            createdAt={order.createdAt}
            paidAt={(order as any).paidAt}
            shippedAt={(order as any).shippedAt}
            deliveredAt={(order as any).deliveredAt}
            status={order.status}
          />

          {/* Thumbnail strip */}
          <div className="flex items-center gap-2 mt-4 mb-2">
            {thumbnailItems.map((item) => {
              const imageUrl = (item as any).variant?.product?.imageUrls?.[0] as string | undefined
              return (
                <div
                  key={item.id}
                  className="w-12 h-12 rounded-lg bg-[#F8F9FA] border border-[#DEE2E6] overflow-hidden flex-shrink-0 relative"
                  title={item.productName}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#6e6e73]" />
                    </div>
                  )}
                </div>
              )
            })}
            {order.items.length > 3 && (
              <div className="w-12 h-12 rounded-lg bg-[#F8F9FA] border border-[#DEE2E6] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-[#6e6e73]">
                  +{order.items.length - 3}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#6e6e73]">
            {itemCount} {itemCount === 1 ? 'položka' : itemCount < 5 ? 'položky' : 'položek'}
          </p>
        </div>

        {/* Right: total */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className="font-mono text-lg font-bold text-[#1d1d1f]">
            {formatPrice(order.totalAmount, order.currency)}
          </span>
        </div>
      </div>
    </Link>
  )
}
