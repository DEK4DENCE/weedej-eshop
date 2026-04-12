"use client"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
})

const HLS_URL = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"

export function HomeCTASection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(HLS_URL)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}))
        return () => hls.destroy()
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = HLS_URL
        video.play().catch(() => {})
      }
    })
  }, [])

  return (
    <section className="relative bg-black py-32 md:py-44 px-6 border-t border-white/10 overflow-hidden">
      {/* HLS background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-30"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55 z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Logo */}
        <motion.div {...fadeUp(0)} className="mb-8 flex justify-center">
          <Logo variant="light" size="lg" />
        </motion.div>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-5xl md:text-6xl font-medium tracking-[-1.5px] text-white mb-5"
        >
          Začni svou cestu s{" "}
          <em style={{ fontFamily: '"Playfair Display", Georgia, serif' }} className="font-normal italic">
            přirozeným
          </em>{" "}
          wellness
        </motion.h2>

        <motion.p {...fadeUp(0.2)} className="text-white/55 text-lg mb-10">
          Prémiové CBD produkty doručené diskrétně až ke dveřím.
          Laboratořemi testováno, přírodou inspirováno.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/products"
              className="bg-white text-black font-semibold rounded-lg px-8 py-3.5 text-sm hover:bg-white/90 transition-colors"
            >
              Nakupovat nyní
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/o-nas"
              className="liquid-glass text-white font-medium rounded-lg px-8 py-3.5 text-sm hover:text-white/80 transition-colors"
            >
              Náš příběh
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
