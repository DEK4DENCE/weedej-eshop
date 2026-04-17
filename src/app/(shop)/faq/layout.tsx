import type { Metadata } from 'next'
import { BASE_URL } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Časté dotazy — Weedej',
  description: 'Odpovědi na nejčastější otázky o CBD produktech, doručení, platbách a vrácení zboží. Vše, co potřebujete vědět o nákupu v Weedej.',
  alternates: { canonical: `${BASE_URL}/faq` },
  openGraph: {
    title: 'Časté dotazy — Weedej',
    description: 'Odpovědi na nejčastější otázky o CBD produktech, doručení, platbách a vrácení zboží.',
    url: `${BASE_URL}/faq`,
    locale: 'cs_CZ',
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
