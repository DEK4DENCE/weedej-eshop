"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Flower2, FlaskConical, Candy } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
})

const categories: { name: string; href: string; Icon: LucideIcon; desc: string }[] = [
  {
    name: "Květy CBD",
    href: "/products?category=kvety",
    Icon: Flower2,
    desc: "Prémiové sušené CBD květy z certifikovaných evropských pěstíren. Bohaté terpény, bez THC.",
  },
  {
    name: "Extrakty",
    href: "/products?category=extrakty",
    Icon: FlaskConical,
    desc: "CBD oleje, vosky a koncentráty. Přesné dávkování, maximální čistota, laboratorně ověřeno.",
  },
  {
    name: "Edibles",
    href: "/products?category=edibles",
    Icon: Candy,
    desc: "CBD gumičky, čokolády a nápoje. Diskrétní, chutné a pohodlné použití kdykoliv.",
  },
]

export function HomeWhySection() {
  return (
    <section className="bg-black pt-32 pb-16 px-6 text-center">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          {...fadeUp(0)}
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] text-[#1d1d1f] mb-6"
        >
          Kvalita, která{" "}
          <em style={{ fontFamily: '"Playfair Display", Georgia, serif' }} className="font-normal italic">
            mluví sama
          </em>
          .
        </motion.h2>
        <motion.p
          {...fadeUp(0.1)}
          className="text-[#6e6e73] text-lg max-w-2xl mx-auto mb-20"
        >
          Každý produkt v našem katalogu prošel přísným výběrem a splňuje
          nejvyšší standardy EU. Žádné kompromisy.
        </motion.p>

        {/* Category cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {categories.map(({ name, href, Icon, desc }, i) => (
            <motion.div key={name} {...fadeUp(i * 0.1)}>
              <Link
                href={href}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-[#DEE2E6] bg-white hover:border-[#1d1d1f]/20 hover:bg-[#F8F9FA] transition-colors"
              >
                <div className="w-44 h-44 rounded-xl bg-[#F8F9FA] flex items-center justify-center group-hover:bg-[#DEE2E6]/50 transition-colors duration-300">
                  <Icon className="w-20 h-20 text-[#6e6e73] group-hover:text-[#1d1d1f] transition-colors duration-300" strokeWidth={1} />
                </div>
                <p className="font-semibold text-[#1d1d1f] text-base">{name}</p>
                <p className="text-[#6e6e73] text-sm leading-relaxed">{desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeUp(0.4)} className="text-[#aeaeb2] text-sm">
          Vše laboratořemi testováno. Certifikáty k dispozici na vyžádání.
        </motion.p>
      </div>
    </section>
  )
}
