import React from 'react'
import { MapPin, CreditCard } from 'lucide-react'
import { Order } from '@/types/order'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderDetailProps {
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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#F0F5F0] mb-1">
              Order #{order.id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-[#6B8A6B]">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Items table */}
      <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1F3D1F]">
          <h3 className="text-sm font-semibold text-[#F0F5F0]">Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#152A15]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B8A6B] uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B8A6B] uppercase tracking-wider">
                  Variant
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#6B8A6B] uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#6B8A6B] uppercase tracking-wider">
                  Qty
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#6B8A6B] uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#152A15]">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#1A2219]/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#F0F5F0]">
                      {item.productName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#B8C8B8]">{item.variantLabel}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-[#D4A017]">
                      {formatPrice(item.unitPrice, order.currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#B8C8B8]">{item.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm font-semibold text-[#D4A017]">
                      {formatPrice(item.unitPrice * item.quantity, order.currency)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery address */}
        {order.address && (
          <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#22A829]" />
              <h3 className="text-sm font-semibold text-[#F0F5F0]">Delivery Address</h3>
            </div>
            <div className="space-y-1 text-sm text-[#B8C8B8]">
              <p className="font-medium text-[#F0F5F0]">{order.address.fullName}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}, {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
            </div>
          </div>
        )}

        {/* Payment summary */}
        <div className="bg-[#111714] border border-[#1F3D1F] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#22A829]" />
            <h3 className="text-sm font-semibold text-[#F0F5F0]">Payment Summary</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#B8C8B8]">Subtotal</span>
              <span className="font-mono text-[#F0F5F0]">
                {formatPrice(order.subtotalAmount, order.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#B8C8B8]">Shipping</span>
              <span className="font-mono text-[#F0F5F0]">
                {order.shippingAmount === 0
                  ? 'Free'
                  : formatPrice(order.shippingAmount, order.currency)}
              </span>
            </div>
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#B8C8B8]">Tax</span>
                <span className="font-mono text-[#F0F5F0]">
                  {formatPrice(order.taxAmount, order.currency)}
                </span>
              </div>
            )}
            <div className="border-t border-[#1F3D1F] pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-[#F0F5F0]">Total</span>
              <span className="font-mono font-bold text-lg text-[#D4A017]">
                {formatPrice(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
