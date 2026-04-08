import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Weedej — Premium Cannabis E-Shop',
    template: '%s | Weedej',
  },
  description:
    'Discover premium cannabis products at Weedej. Quality flowers, edibles, concentrates and accessories. Age-verified, discreet delivery.',
  keywords: ['cannabis', 'CBD', 'premium', 'online shop', 'flowers', 'edibles'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Weedej',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#ebebeb] text-[#1d1d1f] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
