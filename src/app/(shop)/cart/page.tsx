import type { Metadata } from 'next'
import { CartPageClient } from '@/components/cart/CartPageClient'

export const metadata: Metadata = {
  title: 'Košík — Weedej',
  description: 'Zkontrolujte svůj košík a přejděte k pokladně.',
}

export default function CartPage() {
  return <CartPageClient />
}
