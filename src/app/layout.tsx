import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { BASE_URL } from '@/lib/config'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Weedej — Prémiový Cannabis E-Shop',
    template: '%s | Weedej',
  },
  description:
    'Prémiové konopné produkty s doručením po celé ČR. Květy, extrakty, edibles a doplňky. Otestováno laboratořemi, diskrétní balení.',
  keywords: ['cannabis', 'CBD', 'THC', 'konopí', 'prémiové produkty', 'online shop', 'CBD obchod', 'Czech Republic'],
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'Weedej',
    description: 'Prémiové konopné produkty s doručením po celé ČR.',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Weedej',
  url: BASE_URL,
  description: 'Prémiový e-shop s konopnými produkty. Doručení po celé České republice.',
  areaServed: 'CZ',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Zákaznická podpora',
    availableLanguage: 'Czech',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="cs" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="alternate" hrefLang="cs" href={BASE_URL} />
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#ebebeb] text-[#1d1d1f] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
