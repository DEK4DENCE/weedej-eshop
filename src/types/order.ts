export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface Address {
  id: string
  userId: string
  fullName: string
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId: string
  productName: string
  variantLabel: string
  unitPrice: number
  quantity: number
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  subtotalAmount: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  currency: string
  stripeSessionId?: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  address?: Address
}
