export const revalidate = 300

import { db } from "@/lib/db"
import { CartSidebarWrapper } from "@/components/layout/CartSidebarWrapper"
import { Toaster } from "@/components/ui/toaster"
import { HomeNavbar, HomeHero } from "@/components/homepage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Weedej.cz — tested & trusted',
  description: 'Prémiové konopné produkty s doručením po celé ČR. Laboratořemi testováno, přírodou inspirováno.',
  alternates: { canonical: 'https://weedej.cz' },
  openGraph: {
    title: 'Weedej.cz — tested & trusted',
    url: 'https://weedej.cz',
    locale: 'cs_CZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weedej.cz — tested & trusted',
    description: 'Prémiové konopné produkty s doručením po celé ČR. Laboratořemi testováno, přírodou inspirováno.',
  },
}

export interface HomeCategoryData {
  name: string
  slug: string
  image?: string
  desc: string
}

const CATEGORY_DESCS: Record<string, string> = {
  kvety:   "Prémiové sušené CBD květy z certifikovaných evropských pěstíren. Bohaté terpény, bez THC.",
  hasise:  "Prémiový konopný hašiš. Tradiční zpracování, vysoká čistota, intenzivní aroma.",
  hasis:   "Prémiový konopný hašiš. Tradiční zpracování, vysoká čistota, intenzivní aroma.",
  syringe: "Přesně dávkované extrakty v injekční stříkačce. Maximální čistota a snadné použití.",
  default: "Prémiové konopné produkty laboratořemi testované a certifikované.",
}

async function getHomepageCategories(): Promise<HomeCategoryData[]> {
  try {
    // Find the 3 categories by slug (slugs are ASCII-normalized, no diacritics)
    const cats = await db.category.findMany({
      where: {
        isActive: true,
        OR: [
          { slug: { contains: "kvet", mode: "insensitive" } },
          { slug: { contains: "hasi", mode: "insensitive" } },
          { slug: { contains: "syring", mode: "insensitive" } },
        ],
      },
      select: { name: true, slug: true },
      take: 3,
    })

    const result: HomeCategoryData[] = []
    for (const cat of cats) {
      const product = await db.product.findFirst({
        where: { category: { slug: cat.slug }, isActive: true, imageUrls: { isEmpty: false } },
        select: { imageUrls: true },
      })
      result.push({
        name: cat.name,
        slug: cat.slug,
        image: product?.imageUrls?.[0],
        desc: CATEGORY_DESCS[cat.slug] ?? CATEGORY_DESCS.default,
      })
    }

    // Ensure Květy is first
    result.sort((a, b) => {
      const order = (s: string) =>
        s.includes("kvet") ? 0 : s.includes("hasi") ? 1 : 2
      return order(a.slug) - order(b.slug)
    })

    return result
  } catch {
    return []
  }
}


export default async function HomePage() {
  const homeCategories = await getHomepageCategories()

  return (
    <div className="bg-black min-h-screen">
      <HomeNavbar />
      <HomeHero categories={homeCategories} />
      <CartSidebarWrapper />
      <Toaster />
    </div>
  )
}
