import Link from "next/link"
import { ArrowRight, Star, Shield, Truck } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartSidebarWrapper } from "@/components/layout/CartSidebarWrapper"
import { Toaster } from "@/components/ui/toaster"
import { FadeIn } from "@/components/ui/FadeIn"
import { ProductCard } from "@/components/products/ProductCard"
import { db } from "@/lib/db"

async function getBestsellers() {
  try {
    return await db.product.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: { orderBy: { price: "asc" } },
      },
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await getBestsellers()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#F8F9FA]">

        {/* Hero — two-column with light green gradient */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F0FAF0] to-white">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

              {/* Left: text */}
              <FadeIn delay={0}>
                <div className="flex flex-col gap-6">
                  <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 text-sm font-medium">
                    <span className="text-base">🌿</span> Premium Cannabis Products
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#1d1d1f] font-playfair">
                    Modern wellness<br />
                    for <span className="text-[#2E7D32]">every day</span>
                  </h1>
                  <p className="text-lg text-[#6e6e73] max-w-md">
                    Discover our curated selection of premium cannabis flowers, extracts, and edibles. Lab-tested, nature-inspired.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-7 py-3 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)]"
                    >
                      Shop Now <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-transparent border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/5 font-semibold px-7 py-3 rounded-xl text-sm transition-all duration-200"
                    >
                      About us
                    </Link>
                  </div>
                </div>
              </FadeIn>

              {/* Right: product category mosaic */}
              <FadeIn delay={0.2}>
                <div className="grid grid-cols-2 gap-3 h-80 md:h-96">
                  {/* Large top card */}
                  <Link href="/products?category=flowers" className="col-span-2 relative rounded-2xl overflow-hidden bg-[#2E7D32] flex items-center justify-center group hover:opacity-90 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]" />
                    <div className="relative text-center text-white p-6">
                      <div className="text-5xl mb-2">🌿</div>
                      <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Flowers</p>
                    </div>
                  </Link>
                  {/* Bottom left */}
                  <Link href="/products?category=extracts" className="relative rounded-2xl overflow-hidden bg-[#C8E6C9] flex items-center justify-center group hover:opacity-90 transition-opacity">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-1">🌱</div>
                      <p className="text-xs font-semibold text-[#2E7D32] uppercase tracking-wider">Extracts</p>
                    </div>
                  </Link>
                  {/* Bottom right */}
                  <Link href="/products?category=edibles" className="relative rounded-2xl overflow-hidden bg-[#E8F5E9] flex items-center justify-center group hover:opacity-90 transition-opacity">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-1">🍬</div>
                      <p className="text-xs font-semibold text-[#2E7D32] uppercase tracking-wider">Edibles</p>
                    </div>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Features strip — horizontal inline */}
        <section className="bg-white border-y border-[#DEE2E6]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#DEE2E6]">
              {[
                { icon: Star, color: "#D4A017", bg: "#FFF9E6", title: "Premium Quality", desc: "Lab-tested, hand-picked products" },
                { icon: Shield, color: "#2E7D32", bg: "#E8F5E9", title: "Safe & Legal", desc: "Fully compliant with EU regulations" },
                { icon: Truck, color: "#2E7D32", bg: "#E8F5E9", title: "Fast Delivery", desc: "Discreet shipping across Czech Republic" },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="flex items-center gap-4 px-8 py-5">
                  <div className="flex-shrink-0 p-2.5 rounded-xl" style={{ background: bg }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1d1d1f]">{title}</p>
                    <p className="text-xs text-[#6e6e73] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bestsellers */}
        {products.length > 0 && (
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32] mb-1">Our Products</p>
                  <h2 className="text-3xl font-bold text-[#1d1d1f] font-playfair">Bestsellers</h2>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 border border-[#DEE2E6] hover:border-[#2E7D32] text-[#6e6e73] hover:text-[#2E7D32] text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA banner */}
        <section className="py-16 px-4 bg-[#F0FAF0]">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-3 font-playfair text-[#1d1d1f]">Ready to explore?</h2>
            <p className="text-[#6e6e73] mb-7">Browse our full catalog of premium products</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)]"
            >
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
      <CartSidebarWrapper />
      <Toaster />
    </div>
  )
}
