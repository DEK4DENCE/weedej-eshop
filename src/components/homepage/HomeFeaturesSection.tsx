"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { FlaskConical, Shield, Package, Zap } from "lucide-react"

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
})

const features = [
  {
    icon: FlaskConical,
    title: "Laboratořemi testováno",
    desc: "Každý produkt má certifikát o složení a čistotě z akreditované laboratoře.",
  },
  {
    icon: Shield,
    title: "100 % legální",
    desc: "Veškeré produkty splňují EU předpisy. THC pod zákonným limitem.",
  },
  {
    icon: Package,
    title: "Diskrétní doručení",
    desc: "Zásilky bez označení obsahu. Vaše soukromí je pro nás priorita.",
  },
  {
    icon: Zap,
    title: "Rychlé odeslání",
    desc: "Objednávky přijaté do 14:00 expedujeme tentýž den.",
  },
]

interface Props {
  products: any[]
}

export function HomeFeaturesSection({ products }: Props) {
  return (
    <section className="bg-black py-32 md:py-44 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <motion.p {...fadeUp(0)} className="text-xs tracking-[3px] uppercase text-white/40 mb-4">
          Proč Weedej
        </motion.p>

        {/* Heading */}
        <motion.h2
          {...fadeUp(0.05)}
          className="text-4xl md:text-6xl font-medium tracking-[-1px] text-white mb-16"
        >
          Platforma pro{" "}
          <em style={{ fontFamily: '"Playfair Display", Georgia, serif' }} className="font-normal italic">
            prémiové
          </em>{" "}
          konopné produkty
        </motion.h2>

        {/* Bestseller video strip */}
        <motion.div {...fadeUp(0.1)} className="mb-20">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-2xl object-cover aspect-[3/1]"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4"
          />
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} {...fadeUp(i * 0.08)}>
              <div className="flex flex-col gap-3">
                <Icon className="w-5 h-5 text-white/40" />
                <p className="font-semibold text-white text-base">{title}</p>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bestseller product cards */}
        {products.length > 0 && (
          <motion.div {...fadeUp(0.2)}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs tracking-[3px] uppercase text-white/40">Bestsellery</p>
              <Link href="/products" className="text-white/40 text-sm hover:text-white transition-colors">
                Zobrazit vše →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product: any) => {
                const price = product.variants?.[0]?.price ?? product.basePrice
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group liquid-glass rounded-xl p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-white/5 mb-3">
                      {product.imageUrls?.[0] ? (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    <p className="text-white/45 text-xs mt-0.5">
                      od {Number(price).toLocaleString("cs-CZ")} Kč
                    </p>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
