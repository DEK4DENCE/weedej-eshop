import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Časté dotazy — Weedej',
  description: 'Odpovědi na nejčastější otázky o CBD produktech, doručení, platbách a vrácení zboží. Vše, co potřebujete vědět o nákupu v Weedej.',
  alternates: { canonical: 'https://weedej-cannabis-eshop-dek4dences-projects.vercel.app/faq' },
  openGraph: {
    title: 'Časté dotazy — Weedej',
    description: 'Odpovědi na nejčastější otázky o CBD produktech, doručení, platbách a vrácení zboží.',
    url: 'https://weedej-cannabis-eshop-dek4dences-projects.vercel.app/faq',
    locale: 'cs_CZ',
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
