import type { Metadata } from 'next'
import { CartPageClient } from '@/components/cart/CartPageClient'

export const metadata: Metadata = {
  title: 'Your Cart — Weedejna',
  description: 'Review your cart and proceed to checkout.',
}

export default function CartPage() {
  return <CartPageClient />
}
