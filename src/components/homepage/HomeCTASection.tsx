"use client"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

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
    <section className="relative bg-[#F8F9FA] py-32 md:py-44 px-6 border-t border-[#DEE2E6] overflow-hidden">
      {/* HLS background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-10"
      />
      {/* Light overlay */}
      <div className="absolute inset-0 bg-[#F8F9FA]/80 z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Logo mark */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#1d1d1f]/60 mx-auto">
            <div className="w-5 h-5 rounded-full border border-[#1d1d1f]/60" />
          </div>
        </motion.div>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-5xl md:text-6xl font-medium tracking-[-1.5px] text-[#1d1d1f] mb-5"
        >
          Začni svou cestu s{" "}
          <em style={{ fontFamily: '"Playfair Display", Georgia, serif' }} className="font-normal italic">
            přirozeným
          </em>{" "}
          wellness
        </motion.h2>

        <motion.p {...fadeUp(0.2)} className="text-[#6e6e73] text-lg mb-10">
          Prémiové CBD produkty doručené diskrétně až ke dveřím.
          Laboratořemi testováno, přírodou inspirováno.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/products"
              className="bg-[#2E7D32] text-white font-semibold rounded-lg px-8 py-3.5 text-sm hover:bg-[#1a9020] transition-colors"
            >
              Nakupovat nyní
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/o-nas"
              className="border border-[#DEE2E6] bg-white text-[#1d1d1f] font-medium rounded-lg px-8 py-3.5 text-sm hover:border-[#1d1d1f]/40 transition-colors"
            >
              Náš příběh
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
