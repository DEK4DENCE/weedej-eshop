import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartSidebarWrapper } from "@/components/layout/CartSidebarWrapper"
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
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebarWrapper />
      <Toaster />
      <ScrollToTop />
    </div>
  )
}
