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
  twitter: {
    card: 'summary_large_image',
    site: '@weedej_cz',
    creator: '@weedej_cz',
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
    telephone: '+420792342324',
    email: 'info@weedej.cz',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Weedej',
  url: BASE_URL,
  telephone: '+420792342324',
  email: 'info@weedej.cz',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Benešovská 432/3',
    addressLocality: 'Děčín',
    postalCode: '405 02',
    addressCountry: 'CZ',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'], opens: '11:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Wednesday', 'Saturday'], opens: '11:00', closes: '17:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: '00:00', closes: '00:00' },
  ],
  priceRange: '$$',
  currenciesAccepted: 'CZK',
  paymentAccepted: 'Cash, Credit Card',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#ebebeb] text-[#1d1d1f] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
