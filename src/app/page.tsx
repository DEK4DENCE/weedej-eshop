export const revalidate = 300

import { db } from "@/lib/db"
import { CartSidebarWrapper } from "@/components/layout/CartSidebarWrapper"
import { Toaster } from "@/components/ui/toaster"
import {
  HomeNavbar,
  HomeHero,
  HomeWhySection,
  HomeMissionSection,
  HomeFeaturesSection,
  HomeCTASection,
  HomeDarkFooter,
} from "@/components/homepage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Prémiový CBD E-Shop — Weedej',
  description: 'Prémiové konopné produkty s doručením po celé ČR. Laboratořemi testováno, přírodou inspirováno.',
  alternates: { canonical: 'https://weedej.cz' },
  openGraph: {
    title: 'Prémiový CBD E-Shop — Weedej',
    url: 'https://weedej.cz',
    locale: 'cs_CZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prémiový CBD E-Shop — Weedej',
    description: 'Prémiové konopné produkty s doručením po celé ČR. Laboratořemi testováno, přírodou inspirováno.',
  },
}

async function getCategoryImages(): Promise<Record<string, string>> {
  try {
    const slugs = ["kvety", "extrakty", "edibles"]
    const result: Record<string, string> = {}
    for (const slug of slugs) {
      const product = await db.product.findFirst({
        where: { category: { slug }, isActive: true, imageUrls: { isEmpty: false } },
        select: { imageUrls: true },
      })
      if (product?.imageUrls?.[0]) result[slug] = product.imageUrls[0]
    }
    return result
  } catch {
    return {}
  }
}

async function getBestsellers() {
  try {
    const setting = await db.setting.findUnique({ where: { key: "bestsellers" } })
    const ids: string[] = setting?.value ? JSON.parse(setting.value) : []
    if (ids.length > 0) {
      const products = await db.product.findMany({
        where: { id: { in: ids }, isActive: true },
        include: { category: true, variants: { orderBy: { price: "asc" } } },
      })
      return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products
    }
    return await db.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { category: true, variants: { orderBy: { price: "asc" } } },
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [products, categoryImages] = await Promise.all([getBestsellers(), getCategoryImages()])

  return (
    <div className="bg-black min-h-screen">
      <HomeNavbar />
      <HomeHero />
      <HomeWhySection categoryImages={categoryImages} />
      <HomeMissionSection />
      <HomeFeaturesSection products={products} />
      <HomeCTASection />
      <HomeDarkFooter />
      <CartSidebarWrapper />
      <Toaster />
    </div>
  )
}
