import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { Order } from '@/types/order'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderCardProps {
  order: Order
}

function formatPrice(cents: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  // Collect unique product image URLs from items (items don't carry images directly,
  // so we use a placeholder strip based on item count)
  const thumbnailItems = order.items.slice(0, 3)

  return (
    <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-6 hover:border-[#22A829]/50 transition-colors duration-200">
      <div className="flex items-start justify-between gap-4">
        {/* Left: order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm font-semibold text-[#F0F5F0]">
              #{order.id.slice(-8).toUpperCase()}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>

          <p className="text-xs text-[#6B8A6B] mb-4">
            Placed on {formatDate(order.createdAt)}
          </p>

          {/* Thumbnail strip */}
          <div className="flex items-center gap-2 mb-4">
            {thumbnailItems.map((item, index) => (
              <div
                key={item.id}
                className="w-12 h-12 rounded-lg bg-[#1A2219] border border-[#1F3D1F] flex items-center justify-center overflow-hidden flex-shrink-0"
                title={item.productName}
              >
                <Package className="w-5 h-5 text-[#3D5C3D]" />
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-12 h-12 rounded-lg bg-[#1A2219] border border-[#1F3D1F] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-[#6B8A6B]">
                  +{order.items.length - 3}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#B8C8B8]">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Right: total + CTA */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className="font-mono text-lg font-bold text-[#D4A017]">
            {formatPrice(order.totalAmount, order.currency)}
          </span>
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 bg-transparent border border-[#22A829] text-[#22A829] hover:bg-[#22A829]/10 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200"
          >
            View Order
          </Link>
        </div>
      </div>
    </div>
  )
}
