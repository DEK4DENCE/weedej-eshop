import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartSidebarWrapper } from "@/components/layout/CartSidebarWrapper"
import { CookieConsent } from "@/components/layout/CookieConsent"
import { Toaster } from "@/components/ui/toaster"
import { ScrollToTop } from "@/components/ui/ScrollToTop"
import { db } from "@/lib/db"

async function getCategories() {
  const cats = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  })
  return cats.map((c) => ({
    href: `/products?category=${c.slug}`,
    label: c.name,
  }))
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#2E7D32] focus:rounded"
      >
        Přeskočit na obsah
      </a>
      <Header categories={categories} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <CartSidebarWrapper />
      <CookieConsent />
      <Toaster />
      <ScrollToTop />
    </div>
  )
}
