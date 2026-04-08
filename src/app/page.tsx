import Link from "next/link"
import { ArrowRight, Star, Shield, Truck } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CartSidebarWrapper } from "@/components/layout/CartSidebarWrapper"
import { Toaster } from "@/components/ui/toaster"
import { FadeIn } from "@/components/ui/FadeIn"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#F8F9FA]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA] py-14 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <FadeIn delay={0}>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 text-sm font-medium mb-6">
                Premium Cannabis Products
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 font-playfair bg-gradient-to-r from-[#1d1d1f] via-[#3d3d3f] to-[#2E7D32] bg-clip-text text-transparent pb-3">
                Weedejna
              </h1>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-xl text-[#6e6e73] mb-8 max-w-xl mx-auto">
                Discover our curated selection of premium cannabis flowers, extracts, and edibles. Quality you can trust.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1a9020] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(34,168,41,0.35)]"
                >
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Features */}
        <section className="py-14 px-4 bg-[#EDEEF0]">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-[#2E7D32]/10">
                <Star className="h-6 w-6 text-[#2E7D32]" />
              </div>
              <h3 className="font-semibold text-[#1d1d1f]">Premium Quality</h3>
              <p className="text-sm text-[#6e6e73]">Lab-tested, hand-picked products</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-[#b8860b]/10">
                <Shield className="h-6 w-6 text-[#b8860b]" />
              </div>
              <h3 className="font-semibold text-[#1d1d1f]">Safe & Legal</h3>
              <p className="text-sm text-[#6e6e73]">Fully compliant with EU regulations</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-[#2E7D32]/10">
                <Truck className="h-6 w-6 text-[#2E7D32]" />
              </div>
              <h3 className="font-semibold text-[#1d1d1f]">Fast Delivery</h3>
              <p className="text-sm text-[#6e6e73]">Discreet shipping across Czech Republic</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold mb-4 font-playfair text-[#1d1d1f]">Ready to explore?</h2>
            <p className="text-[#6e6e73] mb-8">Browse our full catalog of premium products</p>
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
