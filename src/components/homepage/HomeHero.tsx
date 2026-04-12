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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#F8F9FA]">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4"
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#F8F9FA] to-transparent z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 md:pt-32 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div {...fadeUp(0)} className="flex items-center gap-2 mb-8">
          <div className="flex -space-x-2">
            {[
              "bg-gradient-to-br from-emerald-400 to-green-700",
              "bg-gradient-to-br from-teal-400 to-emerald-600",
              "bg-gradient-to-br from-green-300 to-teal-600",
            ].map((grad, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 border-black ${grad} flex items-center justify-center`}
              >
                <span className="text-white text-[10px] font-bold">{["T", "M", "P"][i]}</span>
              </div>
            ))}
          </div>
          <span className="text-[#6e6e73] text-sm ml-1">50+ prémiových produktů</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] text-[#1d1d1f] leading-[1.05] mb-6"
        >
          Objev sílu{" "}
          <em style={{ fontFamily: '"Playfair Display", Georgia, serif' }} className="font-normal not-italic italic">
            přírody
          </em>
          ,<br />doručenou ke&nbsp;vám
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg text-[#6e6e73] max-w-xl mb-10"
        >
          Laboratořemi testované CBD a konopné produkty. Legální, diskrétní, prémiové.
          Doručení po celé ČR do 2–3 pracovních dnů.
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 items-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/products"
              className="bg-[#1d1d1f] text-white font-semibold rounded-full px-8 py-3.5 text-sm hover:bg-[#1d1d1f]/90 transition-colors"
            >
              Nakupovat →
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/doprava"
              className="border border-[#DEE2E6] bg-white text-[#1d1d1f] font-medium rounded-full px-8 py-3.5 text-sm hover:border-[#1d1d1f] transition-colors"
            >
              Doprava &amp; platba
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
