import type { Metadata } from 'next'
import { Inter, Playfair_Display, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { BASE_URL } from '@/lib/config'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Weedej.cz — tested & trusted',
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
    <html lang="cs" className={`${inter.variable} ${playfair.variable} ${spaceGrotesk.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="alternate" hrefLang="cs" href={BASE_URL} />
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
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
