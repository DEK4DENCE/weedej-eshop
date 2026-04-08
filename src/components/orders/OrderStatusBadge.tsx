import React from 'react'
import { OrderStatus } from '@/types/order'

interface StatusConfig {
  bg: string
  text: string
  label: string
  border?: string
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
  PENDING: { bg: '#2E2200', text: '#F5B800', label: 'Pending' },
  PAID: { bg: '#0D2000', text: '#2E7D32', label: 'Payment Confirmed', border: '#1A6B1D' },
  PROCESSING: { bg: '#0E1B2D', text: '#60A5FA', label: 'Processing' },
  PACKED: { bg: '#0D1A2D', text: '#38BDF8', label: 'Packed', border: '#0E4A7A' },
  SHIPPED: { bg: '#1A1A2E', text: '#A78BFA', label: 'Shipped' },
  OUT_FOR_DELIVERY: { bg: '#1A0D2E', text: '#C084FC', label: 'Out for Delivery', border: '#5B2D8A' },
  DELIVERED: { bg: '#0D2E0E', text: '#2E7D32', label: 'Delivered' },
  CANCELLED: { bg: '#2D0E0E', text: '#E53E3E', label: 'Cancelled' },
  REFUNDED: { bg: '#1A1505', text: '#D4A017', label: 'Refunded' },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    bg: '#1A2219',
    text: '#B8C8B8',
    label: status,
  }

  return (
    <span
      className={`inline-flex items-center font-mono text-xs font-medium px-3 py-1 rounded-full ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: config.border ? `1px solid ${config.border}` : undefined,
      }}
    >
      {config.label}
    </span>
  )
}
