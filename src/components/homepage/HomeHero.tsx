"use client"
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"

type DoorCategory = { slug: string; name: string; tagline: string }

const FALLBACK: DoorCategory[] = [
  { slug: "kvety",   name: "Květy",    tagline: "Sušené CBD květy" },
  { slug: "hasis",   name: "Hašiš",    tagline: "Tradiční konopný hašiš" },
  { slug: "syringe", name: "Extrakty", tagline: "Dávkované extrakty" },
]

function orderCategories(cats: { slug: string; name: string }[]): DoorCategory[] {
  const pick = (m: (s: string) => boolean, fb: DoorCategory) =>
    cats.find(c => m(c.slug.toLowerCase())) ?? fb
  return [
    { ...pick(s => s.includes("kvet"),   FALLBACK[0]), tagline: FALLBACK[0].tagline },
    { ...pick(s => s.includes("hasi"),   FALLBACK[1]), tagline: FALLBACK[1].tagline },
    { ...pick(s => s.includes("syring") || s.includes("extrakt"), FALLBACK[2]), tagline: FALLBACK[2].tagline },
  ]
}

const ss = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export function HomeHero({ categories }: { categories?: { slug: string; name: string }[] } = {}) {
  const doors      = categories && categories.length >= 3 ? orderCategories(categories) : FALLBACK
  const sectionRef = useRef<HTMLDivElement>(null)
  const bothRef    = useRef<HTMLDivElement>(null)
  const doorsRef   = useRef<HTMLDivElement>(null)
  const labelsRef  = useRef<HTMLDivElement[]>([])
  const reduced    = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  // ── Standard MotionValue transforms
  const hintOpacity   = useTransform(scrollYProgress, [0, 0.08], [1, 0])

  const nebulaOpacity = useTransform(scrollYProgress, [0, 0.12, 0.28], [1, 1, 0])
  const nebulaX       = useTransform(scrollYProgress, [0.12, 0.28], ["0%", "-30%"])
  const nebulaScale   = useTransform(scrollYProgress, [0, 0.28], [1, 1.04])

  const rightOpacity  = useTransform(scrollYProgress, [0.12, 0.26, 0.36, 0.50], [0, 1, 1, 0])
  const rightX        = useTransform(scrollYProgress, [0.12, 0.26, 0.50], ["15%", "0%", "0%"])
  const rightScale    = useTransform(scrollYProgress, [0.12, 0.26, 0.50], [0.96, 1.04, 1.04])

  const leftOpacity   = useTransform(scrollYProgress, [0.36, 0.50, 0.56, 0.68], [0, 1, 1, 0])
  const leftScale     = useTransform(scrollYProgress, [0.36, 0.68], [0.95, 1.05])

  const bothOpacity   = useTransform(scrollYProgress, [0.56, 0.68, 0.76, 0.82, 0.94], [0, 1, 1, 0.5, 0])
  const bothScale     = useTransform(scrollYProgress, [0.56, 0.94], [0.95, 1.05])

  // ── Mask-based effects via direct DOM manipulation (reliable for non-standard CSS)
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return

    if (bothRef.current) {
      const transT = ss(0.76, 0.94, p)
      if (transT <= 0) {
        bothRef.current.style.webkitMaskImage = "none"
        bothRef.current.style.maskImage = "none"
      } else {
        const cx = Math.round(transT * 62)
        const cy = Math.round(transT * 78)
        const mask = `radial-gradient(ellipse ${cx}% ${cy}% at 50% 50%, transparent 0%, transparent 55%, rgba(0,0,0,${(1 - transT).toFixed(2)}) 70%, black 100%)`
        bothRef.current.style.webkitMaskImage = mask
        bothRef.current.style.maskImage = mask
      }
    }

    if (doorsRef.current) {
      const s5 = ss(0.76, 0.96, p)
      doorsRef.current.style.opacity = String(s5)
      doorsRef.current.style.pointerEvents = s5 > 0.1 ? "auto" : "none"
      if (s5 <= 0) {
        doorsRef.current.style.webkitMaskImage = "none"
        doorsRef.current.style.maskImage = "none"
        doorsRef.current.style.transform = "scale(0.92)"
      } else {
        const rPct  = Math.round(20 + s5 * 82)
        const rPctY = Math.round(20 + s5 * 92)
        const mask = `radial-gradient(ellipse ${rPct}% ${rPctY}% at 50% 52%, black 30%, rgba(0,0,0,0.6) 65%, transparent 100%)`
        doorsRef.current.style.webkitMaskImage = mask
        doorsRef.current.style.maskImage = mask
        doorsRef.current.style.transform = `scale(${0.92 + s5 * 0.08})`
      }
    }

    const labelOp = String(ss(0.6, 0.85, ss(0.76, 0.96, p)))
    labelsRef.current.forEach(el => { if (el) el.style.opacity = labelOp })
  })

  const dusts = Array.from({ length: 32 })

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black"
      style={{ height: "600vh" }}
      aria-label="Weedej — vstupte do světa prémiového konopí"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Floor */}
        <div
          className="absolute left-0 right-0 z-[5]"
          style={{
            top: "52%", height: "60%",
            backgroundImage: "url('/hero/floor.png')",
            backgroundSize: "500px 500px",
            backgroundRepeat: "repeat",
            backgroundPosition: "center 50%",
          }}
        />

        {/* Scene 1: Nebula */}
        <motion.div
          style={reduced ? undefined : { opacity: nebulaOpacity, x: nebulaX, scale: nebulaScale }}
          className="absolute inset-0 z-[10]"
        >
          <Image src="/hero/nebula.png" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        </motion.div>

        {/* Scene 2: Wall Right */}
        <motion.div
          style={reduced ? undefined : { opacity: rightOpacity, x: rightX, scale: rightScale }}
          className="absolute inset-0 z-[15]"
        >
          <Image src="/hero/wall-right.png" alt="" fill sizes="100vw" className="object-cover object-center" />
        </motion.div>

        {/* Scene 3: Wall Left */}
        <motion.div
          style={reduced ? undefined : { opacity: leftOpacity, scale: leftScale }}
          className="absolute inset-0 z-[20]"
        >
          <Image src="/hero/wall-left.png" alt="" fill sizes="100vw" className="object-cover object-center" />
        </motion.div>

        {/* Vignette */}
        <div
          className="absolute inset-0 z-[22] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 40%, rgba(0,0,5,0.5) 75%, rgba(0,0,10,0.92) 100%)" }}
        />

        {/* Scene 3.5: Both Sides — ref used for mask updates */}
        <motion.div
          style={reduced ? undefined : { opacity: bothOpacity, scale: bothScale }}
          className="absolute inset-0 z-[30]"
        >
          <div ref={bothRef} className="absolute inset-0">
            <Image src="/hero/both-sides.png" alt="" fill sizes="100vw" className="object-cover object-center" />
          </div>
        </motion.div>

        {/* Scene 5: Doors — ref used for opacity + mask + scale updates */}
        <div
          ref={doorsRef}
          className="absolute inset-0 z-[35]"
          style={{ opacity: 0, transformOrigin: "center center", pointerEvents: "none" }}
        >
          <Image src="/hero/doors.png" alt="Tři brány — Květy, Hašiš, Extrakty" fill sizes="100vw" className="object-cover object-center" />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] max-w-[1100px] aspect-[3/1.7] grid grid-cols-3 gap-1">
            {doors.map((cat, idx) => {
              const glow =
                idx === 0 ? "rgba(52,211,153,0.50)"
              : idx === 1 ? "rgba(251,191,36,0.50)"
              :             "rgba(167,139,250,0.55)"
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  aria-label={`Vstoupit do sekce ${cat.name}`}
                  className="group relative flex items-center justify-center"
                >
                  <div className="absolute inset-x-[8%] inset-y-[6%] rounded-t-[50%] bg-white/0 transition-all duration-500 group-hover:bg-white/10" />
                  <div
                    className="absolute inset-x-[8%] inset-y-[6%] rounded-t-[50%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 80px 10px ${glow}, 0 0 60px 4px ${glow}` }}
                  />
                  <div
                    ref={el => { if (el) labelsRef.current[idx] = el as HTMLDivElement }}
                    className="relative z-10 text-center translate-y-[55%]"
                    style={{ opacity: 0 }}
                  >
                    <div className="text-white font-semibold text-base md:text-2xl tracking-[0.15em] uppercase door-label-glow">
                      {cat.name}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Floating dust */}
        <svg
          className="absolute inset-0 z-[45] pointer-events-none mix-blend-screen opacity-50"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {dusts.map((_, i) => {
            const x   = (i * 137) % 1000
            const y   = (i * 211) % 1000
            const r   = 0.7 + ((i * 7) % 25) / 10
            const dur = 14 + ((i * 13) % 22)
            const del = (i * 0.37) % 6
            return (
              <circle key={i} cx={x} cy={y} r={r} fill="#c4b5fd">
                <animate attributeName="cy" values={`${y};${(y - 160 + 1000) % 1000};${y}`} dur={`${dur}s`} begin={`-${del}s`} repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.1;0.9;0.1" dur={`${dur * 0.6}s`} begin={`-${del}s`} repeatCount="indefinite" />
              </circle>
            )
          })}
        </svg>

        {/* Scroll hint */}
        <motion.div
          style={reduced ? { opacity: 1 } : { opacity: hintOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[50] flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="text-white/40 text-[11px] font-semibold tracking-[0.35em] uppercase">Scrolluj</span>
          <div className="relative w-px h-12 overflow-hidden">
            <div className="absolute inset-x-0 top-0 w-px h-6 bg-gradient-to-b from-white to-transparent animate-[scrollhint_1.8s_ease-in-out_infinite]" />
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[48] pointer-events-none" />

        <style>{`
          @keyframes scrollhint {
            0%   { transform: translateY(-100%); opacity: 0; }
            40%  { opacity: 1; }
            100% { transform: translateY(200%); opacity: 0; }
          }
          @keyframes doorGlow {
            0%, 100% { text-shadow: 0 0 14px rgba(255,255,255,0.75), 0 0 30px rgba(255,255,255,0.3); }
            50%       { text-shadow: 0 0 24px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,0.6), 0 0 100px rgba(200,230,255,0.4); }
          }
          .door-label-glow {
            animation: doorGlow 2.4s ease-in-out infinite;
          }
        `}</style>
      </div>
    </section>
  )
}
