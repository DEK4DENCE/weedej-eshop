"use client"
import { motion } from "framer-motion"
import Link from "next/link"

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
})

export function HomeHero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4"
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 md:pt-20 max-w-4xl mx-auto w-full">
        {/* Heading */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] text-white leading-[1.05] mb-28 md:mb-36"
        >
          Objev sílu{" "}
          <em style={{ fontFamily: '"Playfair Display", Georgia, serif' }} className="font-normal not-italic italic">
            přírody
          </em>
          ,<br />doručenou až k&nbsp;Vašim dveřím
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg text-[hsl(210,17%,82%)] max-w-xl mb-8"
        >
          Laboratořemi testované CBD a konopné produkty. Legální, diskrétní, prémiové.
          Doručení po celé ČR do 2–3 pracovních dnů.
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 items-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/products"
              className="bg-white text-black font-semibold rounded-full px-8 py-3.5 text-sm hover:bg-white/90 transition-colors"
            >
              Nakupovat →
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/doprava"
              className="liquid-glass text-white font-medium rounded-full px-8 py-3.5 text-sm hover:text-white/80 transition-colors"
            >
              Doprava &amp; platba
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
