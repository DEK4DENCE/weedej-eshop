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
    const setting = await db.setting.findUnique({ where: { key: "bestsellers" } })
    const ids: string[] = setting?.value ? JSON.parse(setting.value) : []
    if (ids.length > 0) {
      const products = await db.product.findMany({
        where: { id: { in: ids }, isActive: true },
        include: { category: true, variants: { orderBy: { price: "asc" } } },
      })
      // preserve admin-defined order
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
  const products = await getBestsellers()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#F8F9FA]">

        {/* Hero — centered with light green gradient */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F0FAF0] to-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <FadeIn delay={0}>
              <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 text-sm font-medium">
                  <span className="text-base">🌿</span> Prémiové CBD produkty
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#1d1d1f] font-playfair">
                  Moderní wellness<br />
                  <span className="text-[#2E7D32]">pro každý den</span>
                </h1>
                <p className="text-lg text-[#6e6e73] max-w-xl">
                  Objevte naši kurátorsky vybranou kolekci prémiových konopných produktů. Laboratořemi testováno, přírodou inspirováno.
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-7 py-3 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)]"
                  >
                    Nakupovat <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-transparent border-2 border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/5 font-semibold px-7 py-3 rounded-xl text-sm transition-all duration-200"
                  >
                    Více o nás
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Bestsellers */}
        {products.length > 0 && (
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32] mb-1">Naše produkty</p>
                  <h2 className="text-3xl font-bold text-[#1d1d1f] font-playfair">Bestsellery</h2>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 border border-[#DEE2E6] hover:border-[#2E7D32] text-[#6e6e73] hover:text-[#2E7D32] text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  Zobrazit vše <ArrowRight className="h-3.5 w-3.5" />
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

        {/* Features strip — horizontal inline */}
        <section className="bg-white border-y border-[#DEE2E6]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#DEE2E6]">
              {[
                { icon: Star, color: "#D4A017", bg: "#FFF9E6", title: "Prémiová kvalita", desc: "Laboratořemi testované, ručně vybrané produkty" },
                { icon: Shield, color: "#2E7D32", bg: "#E8F5E9", title: "Bezpečné & legální", desc: "Plně v souladu s EU předpisy" },
                { icon: Truck, color: "#2E7D32", bg: "#E8F5E9", title: "Rychlé doručení", desc: "Diskrétní zásilky po celé ČR" },
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

        {/* CTA banner */}
        <section className="py-16 px-4 bg-[#F0FAF0]">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-3 font-playfair text-[#1d1d1f]">Připraveni prozkoumat?</h2>
            <p className="text-[#6e6e73] mb-7">Prohlédněte si náš kompletní katalog prémiových produktů</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)]"
            >
              Zobrazit všechny produkty <ArrowRight className="h-4 w-4" />
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
