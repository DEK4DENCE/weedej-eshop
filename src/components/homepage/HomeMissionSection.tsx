"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

function ScrollRevealText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.4"] })
  const words = text.split(" ")
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length
        const end = (i + 1) / words.length
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1])
        return (
          <motion.span key={i} style={{ opacity }} className="inline-block mr-[0.25em]">
            {word}
          </motion.span>
        )
      })}
    </p>
  )
}

export function HomeMissionSection() {
  return (
    <section className="bg-white pt-0 pb-32 md:pb-44 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Video */}
        <div className="flex justify-center mb-20">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-[600px] rounded-2xl object-cover aspect-square"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4"
          />
        </div>

        <ScrollRevealText
          text="Weedej vznikl z vášně pro legální konopnou kulturu — kde zákazníci nacházejí prémiové produkty, pěstitelé prémiové partnery, a každá zásilka přináší zkušenost, na kterou se těšíte."
          className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1px] leading-[1.3] mb-10 text-[#1d1d1f]"
        />
        <ScrollRevealText
          text="Platforma, kde obsah, komunita a produkty proudí společně — s méně hlukem, méně kompromisy a více autenticitou pro každého zákazníka."
          className="text-xl md:text-2xl lg:text-3xl font-medium leading-[1.4] text-[#6e6e73]"
        />
      </div>
    </section>
  )
}
