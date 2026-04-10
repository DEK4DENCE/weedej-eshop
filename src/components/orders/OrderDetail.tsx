import React from 'react'
import { MapPin, CreditCard, User, Package } from 'lucide-react'
import { Order } from '@/types/order'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderDetailProps {
  order: Order & {
    address?: {
      fullName: string
      line1: string
      line2?: string | null
      city: string
      postalCode: string
      country: string
    } | null
    user?: {
      name?: string | null
      email?: string | null
      phone?: string | null
    } | null
  }
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
      <div className="bg-white border border-[#DEE2E6] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-1">
              Order #{order.id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-[#6e6e73]">
              Zadáno {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white border border-[#DEE2E6] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="px-6 py-4 border-b border-[#DEE2E6]">
          <h3 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#2E7D32]" /> Položky
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F8F9FA]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6e6e73] uppercase tracking-wider">Produkt</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6e6e73] uppercase tracking-wider">Varianta</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#6e6e73] uppercase tracking-wider">Cena/ks</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#6e6e73] uppercase tracking-wider">Počet</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-[#6e6e73] uppercase tracking-wider">Mezisoučet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F9FA]">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8F9FA]/60 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#1d1d1f]">{item.productName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#6e6e73]">{item.variantLabel}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-[#1d1d1f]">
                      {formatPrice(item.unitPrice, order.currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#6e6e73]">{item.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm font-semibold text-[#1d1d1f]">
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
          <div className="bg-white border border-[#DEE2E6] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Doručovací adresa</h3>
            </div>
            <div className="space-y-1 text-sm text-[#515154]">
              <p className="font-medium text-[#1d1d1f]">{order.address.fullName}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>{order.address.city}, {order.address.postalCode}</p>
              <p>{order.address.country}</p>
            </div>
          </div>
        )}

        {/* Contact info */}
        {order.user && (
          <div className="bg-white border border-[#DEE2E6] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Kontaktní informace</h3>
            </div>
            <div className="space-y-1 text-sm text-[#515154]">
              {order.user.name && <p className="font-medium text-[#1d1d1f]">{order.user.name}</p>}
              {order.user.email && <p>{order.user.email}</p>}
              {order.user.phone && <p>{order.user.phone}</p>}
            </div>
          </div>
        )}

        {/* Payment summary */}
        <div className="bg-white border border-[#DEE2E6] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#2E7D32]" />
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Přehled platby</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6e6e73]">Mezisoučet</span>
              <span className="font-mono text-[#1d1d1f]">{formatPrice(order.subtotalAmount, order.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6e6e73]">Doprava</span>
              <span className="font-mono text-[#1d1d1f]">
                {order.shippingAmount === 0 ? 'Zdarma' : formatPrice(order.shippingAmount, order.currency)}
              </span>
            </div>
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6e6e73]">DPH</span>
                <span className="font-mono text-[#1d1d1f]">{formatPrice(order.taxAmount, order.currency)}</span>
              </div>
            )}
            <div className="border-t border-[#DEE2E6] pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-[#1d1d1f]">Celkem</span>
              <span className="font-mono font-bold text-lg text-[#2E7D32]">
                {formatPrice(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
