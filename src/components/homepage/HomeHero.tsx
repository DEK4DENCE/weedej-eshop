"use client"
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useRef, useCallback } from "react"

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

// Smooth-step — for opacity and mask transitions
const ss = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

// Cinematic ease-out — for scale and positional transforms
const cin = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return 1 - Math.pow(1 - t, 3)
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Scene progress targets — the scrollYProgress value where each scene is fully centred
const SCENE_PROGRESS = [0.10, 0.23, 0.40, 0.57, 0.73, 0.92] as const

export function HomeHero({ categories }: { categories?: { slug: string; name: string }[] } = {}) {
  const doors      = categories && categories.length >= 3 ? orderCategories(categories) : FALLBACK
  const sectionRef = useRef<HTMLDivElement>(null)
  const bothRef    = useRef<HTMLDivElement>(null)
  const doorsRef   = useRef<HTMLDivElement>(null)
  const chargeRef  = useRef<HTMLDivElement>(null)

  // Scene image refs
  const nebulaRef  = useRef<HTMLDivElement>(null)
  const ceilingRef = useRef<HTMLDivElement>(null)
  const rightRef   = useRef<HTMLDivElement>(null)
  const leftRef    = useRef<HTMLDivElement>(null)

  // Tint / particle refs
  const nebulaTintRef      = useRef<HTMLDivElement>(null)
  const labTintRef         = useRef<HTMLDivElement>(null)
  const nebulaParticlesRef = useRef<SVGSVGElement>(null)
  const labParticlesRef    = useRef<SVGSVGElement>(null)

  // Click-zone refs (scenes 1-5) for pointer-event toggling
  const zone1Ref = useRef<HTMLDivElement>(null)
  const zone2Ref = useRef<HTMLDivElement>(null)
  const zone3Ref = useRef<HTMLDivElement>(null)
  const zone4Ref = useRef<HTMLDivElement>(null)
  const zone5Ref = useRef<HTMLDivElement>(null)

  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])

  // ── Smooth-scroll to a given scrollYProgress position within the section
  const scrollToScene = useCallback((targetProgress: number) => {
    if (!sectionRef.current) return
    const sectionTop    = sectionRef.current.offsetTop
    const sectionHeight = sectionRef.current.offsetHeight
    const viewportH     = window.innerHeight
    const scrollable    = sectionHeight - viewportH
    window.scrollTo({ top: sectionTop + targetProgress * scrollable, behavior: "smooth" })
  }, [])

  // ── All scene updates in one handler for frame-accurate synchronisation
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return

    // ── Scene 1: Nebula (0.0 → 0.26) — Ken Burns + left drift
    let op1 = 0
    if (nebulaRef.current) {
      op1 =
        p < 0.04 ? lerp(0, 1, p / 0.04) :
        p < 0.16 ? 1 :
        p < 0.26 ? lerp(1, 0, ss(0.16, 0.26, p)) : 0
      nebulaRef.current.style.opacity   = String(op1)
      nebulaRef.current.style.transform = `scale(${lerp(1.0, 1.06, cin(0.0, 0.26, p))}) translateX(${lerp(0, -4, cin(0.0, 0.26, p))}%)`
    }

    // ── Nebula blue tint (z-[11])
    if (nebulaTintRef.current) {
      nebulaTintRef.current.style.opacity = String(
        p < 0.22 ? lerp(0.18, 0, ss(0.0, 0.22, p)) : 0
      )
    }

    // ── Nebula star particles (z-[12])
    if (nebulaParticlesRef.current) {
      const o =
        p < 0.04 ? lerp(0, 1, p / 0.04) :
        p < 0.18 ? 1 :
        p < 0.28 ? lerp(1, 0, ss(0.18, 0.28, p)) : 0
      nebulaParticlesRef.current.style.opacity = String(o * 0.6)
    }

    // ── Scene 2: Ceiling (0.12 → 0.34) — foggy background
    let op2 = 0
    if (ceilingRef.current) {
      op2 =
        p < 0.12 ? 0 :
        p < 0.20 ? lerp(0, 1, ss(0.12, 0.20, p)) :
        p < 0.26 ? 1 :
        p < 0.34 ? lerp(1, 0, ss(0.26, 0.34, p)) : 0
      ceilingRef.current.style.opacity   = String(op2)
      ceilingRef.current.style.transform = `scale(${lerp(1.0, 1.04, cin(0.12, 0.34, p))})`
    }

    // ── Scene 3: Wall Right (0.26 → 0.52) — lateral pan
    let op3 = 0
    if (rightRef.current) {
      op3 =
        p < 0.26 ? 0 :
        p < 0.36 ? lerp(0, 1, ss(0.26, 0.36, p)) :
        p < 0.44 ? 1 :
        p < 0.52 ? lerp(1, 0, ss(0.44, 0.52, p)) : 0
      const xPct =
        p < 0.26 ? 8 :
        p < 0.36 ? lerp(8, 0, cin(0.26, 0.36, p)) :
        p < 0.52 ? lerp(0, -4, cin(0.36, 0.52, p)) : -4
      rightRef.current.style.opacity   = String(op3)
      rightRef.current.style.transform = `scale(${lerp(0.97, 1.04, cin(0.26, 0.52, p))}) translateX(${xPct}%)`
    }

    // ── Scene 4: Wall Left (0.44 → 0.68) — continue pan + bounce
    let op4 = 0
    if (leftRef.current) {
      op4 =
        p < 0.44 ? 0 :
        p < 0.54 ? lerp(0, 1, ss(0.44, 0.54, p)) :
        p < 0.60 ? 1 :
        p < 0.68 ? lerp(1, 0, ss(0.60, 0.68, p)) : 0
      const xPct =
        p < 0.44 ? -6 :
        p < 0.54 ? lerp(-6, 0, cin(0.44, 0.54, p)) :
        p < 0.68 ? lerp(0, 3, cin(0.54, 0.68, p)) : 3
      leftRef.current.style.opacity   = String(op4)
      leftRef.current.style.transform = `scale(${lerp(0.96, 1.05, cin(0.44, 0.68, p))}) translateX(${xPct}%)`
    }

    // ── Lab teal tint (z-[21])
    if (labTintRef.current) {
      labTintRef.current.style.opacity = String(
        p < 0.26 ? 0 :
        p < 0.34 ? lerp(0, 0.12, ss(0.26, 0.34, p)) :
        p < 0.68 ? 0.12 :
        p < 0.76 ? lerp(0.12, 0, ss(0.68, 0.76, p)) : 0
      )
    }

    // ── Lab spark particles (z-[26])
    if (labParticlesRef.current) {
      labParticlesRef.current.style.opacity = String(
        p < 0.26 ? 0 :
        p < 0.34 ? lerp(0, 0.7, ss(0.26, 0.34, p)) :
        p < 0.68 ? 0.7 :
        p < 0.76 ? lerp(0.7, 0, ss(0.68, 0.76, p)) : 0
      )
    }

    // ── Scene 5: Both Sides (0.60 → 0.94) — mask dissolve exit
    let op5 = 0
    if (bothRef.current) {
      op5 =
        p < 0.60 ? 0 :
        p < 0.70 ? lerp(0, 1, ss(0.60, 0.70, p)) :
        p < 0.76 ? 1 :
        p < 0.86 ? lerp(1, 0.4, ss(0.76, 0.86, p)) :
        p < 0.94 ? lerp(0.4, 0, ss(0.86, 0.94, p)) : 0

      const parentEl = bothRef.current.parentElement as HTMLElement | null
      if (parentEl) {
        parentEl.style.opacity   = String(op5)
        parentEl.style.transform = `scale(${lerp(0.95, 1.06, cin(0.60, 0.94, p))})`
      }
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

    // ── Door pre-charge glow (0.72 → 0.82)
    if (chargeRef.current) {
      chargeRef.current.style.opacity = String(
        p >= 0.72 && p < 0.82 ? ss(0.72, 0.80, p) : 0
      )
    }

    // ── Scene 6: Doors (0.80 → 1.0)
    if (doorsRef.current) {
      const s5 =
        p < 0.80 ? 0 :
        p < 0.86 ? lerp(0, 0.6, ss(0.80, 0.86, p)) :
        p < 0.90 ? lerp(0.6, 1.0, ss(0.86, 0.90, p)) : 1.0
      doorsRef.current.style.opacity      = String(s5)
      doorsRef.current.style.pointerEvents = s5 > 0.1 ? "auto" : "none"
      if (s5 <= 0) {
        doorsRef.current.style.webkitMaskImage = "none"
        doorsRef.current.style.maskImage        = "none"
        doorsRef.current.style.transform        = "scale(0.92)"
      } else {
        const rPct  = Math.round(20 + s5 * 100)
        const rPctY = Math.round(20 + s5 * 110)
        const mask = `radial-gradient(ellipse ${rPct}% ${rPctY}% at 50% 52%, black 30%, rgba(0,0,0,0.6) 65%, transparent 100%)`
        doorsRef.current.style.webkitMaskImage = mask
        doorsRef.current.style.maskImage        = mask
        doorsRef.current.style.transform        = `scale(${0.92 + s5 * 0.08})`
      }
    }

    // ── Click zone pointer-event toggling — only active scene's zone is clickable
    const zones = [zone1Ref, zone2Ref, zone3Ref, zone4Ref, zone5Ref]
    const ops   = [op1, op2, op3, op4, op5]
    zones.forEach((ref, i) => {
      if (ref.current) ref.current.style.pointerEvents = ops[i] > 0.5 ? "auto" : "none"
    })
  })

  // ── Particle data
  const nebulaStars = Array.from({ length: 30 }, (_, i) => ({
    cx: (i * 137 + 41) % 1000, cy: (i * 211 + 73) % 1000,
    r: 0.4 + ((i * 7) % 8) / 10, dur: 20 + ((i * 13) % 15), del: (i * 0.43) % 8,
    fill: ["#ffffff", "#c4e4ff", "#a5b4fc"][i % 3],
  }))

  const labSparks = Array.from({ length: 25 }, (_, i) => ({
    cx: (i * 173 + 89) % 1000, cy: (i * 241 + 31) % 1000,
    r: 0.6 + ((i * 11) % 14) / 10, dur: 8 + ((i * 7) % 10), del: (i * 0.29) % 5,
    driftX: (i % 2 === 0 ? 1 : -1) * (30 + ((i * 17) % 60)),
    fill: ["#67e8f9", "#f0abfc", "#34d399"][i % 3],
  }))

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black"
      style={{ height: "600vh" }}
      aria-label="Weedej — vstupte do světa prémiového konopí"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ── Scene 1: Nebula / space window (z-[10]) */}
        <div
          ref={nebulaRef}
          className="absolute inset-0 z-[10]"
          style={{ opacity: 1, transformOrigin: "center center", willChange: "transform, opacity" }}
        >
          <Image src="/hero/nebula.png" alt="" fill priority sizes="100vw" className="object-cover object-center" />

          {/* Click zone 1 — the porthole window frame */}
          <div
            ref={zone1Ref}
            onClick={() => scrollToScene(SCENE_PROGRESS[1])}
            className="absolute left-[12%] right-[12%] top-[12%] bottom-[28%] rounded-[8%] group cursor-pointer"
            style={{ pointerEvents: "auto" }}
          >
            <div className="absolute inset-0 rounded-[8%] bg-white/0 group-hover:bg-white/5 transition-all duration-500" />
            <div
              className="absolute inset-0 rounded-[8%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: "inset 0 0 80px 8px rgba(139,92,246,0.18), 0 0 50px 4px rgba(139,92,246,0.12)" }}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-white/50 text-[10px] font-semibold tracking-[0.4em] uppercase">vstoupit</span>
            </div>
          </div>
        </div>

        {/* Nebula tint (z-[11]) */}
        <div ref={nebulaTintRef} className="absolute inset-0 z-[11] pointer-events-none bg-[#0a0a3a]" style={{ opacity: 0.18 }} />

        {/* Nebula star particles (z-[12]) */}
        <svg ref={nebulaParticlesRef} className="absolute inset-0 z-[12] pointer-events-none mix-blend-screen" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ opacity: reduced ? 0 : 0.6 }}>
          {nebulaStars.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill}>
              <animate attributeName="cy" values={`${s.cy};${(s.cy - 120 + 1000) % 1000};${s.cy}`} dur={`${s.dur}s`} begin={`-${s.del}s`} repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.1;0.95;0.1" dur={`${s.dur * 0.6}s`} begin={`-${s.del}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* ── Scene 2: Ceiling / foggy background (z-[13]) */}
        <div
          ref={ceilingRef}
          className="absolute inset-0 z-[13]"
          style={{ opacity: 0, transformOrigin: "center center", willChange: "transform, opacity" }}
        >
          <Image src="/hero/ceiling.png" alt="" fill sizes="100vw" className="object-cover object-center" />

          {/* Click zone 2 — entire foggy background */}
          <div
            ref={zone2Ref}
            onClick={() => scrollToScene(SCENE_PROGRESS[2])}
            className="absolute inset-0 group cursor-pointer"
            style={{ pointerEvents: "none" }}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-500" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: "inset 0 0 120px 12px rgba(96,165,250,0.12)" }}
            />
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-white/50 text-[10px] font-semibold tracking-[0.4em] uppercase">vstoupit</span>
            </div>
          </div>
        </div>

        {/* ── Scene 3: Wall Right (z-[15]) */}
        <div
          ref={rightRef}
          className="absolute inset-0 z-[15]"
          style={{ opacity: 0, transformOrigin: "center center", willChange: "transform, opacity" }}
        >
          <Image src="/hero/wall-right.png" alt="" fill sizes="100vw" className="object-cover object-center" />

          {/* Click zone 3 — right dark corridor side */}
          <div
            ref={zone3Ref}
            onClick={() => scrollToScene(SCENE_PROGRESS[3])}
            className="absolute right-0 top-0 bottom-0 left-[50%] group cursor-pointer"
            style={{ pointerEvents: "none" }}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-500" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: "inset -80px 0 120px -20px rgba(103,232,249,0.15)" }}
            />
            <div className="absolute bottom-16 right-[20%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-white/50 text-[10px] font-semibold tracking-[0.4em] uppercase">→</span>
            </div>
          </div>
        </div>

        {/* ── Scene 4: Wall Left (z-[20]) */}
        <div
          ref={leftRef}
          className="absolute inset-0 z-[20]"
          style={{ opacity: 0, transformOrigin: "center center", willChange: "transform, opacity" }}
        >
          <Image src="/hero/wall-left.png" alt="" fill sizes="100vw" className="object-cover object-center" />

          {/* Click zone 4 — left dark corridor side */}
          <div
            ref={zone4Ref}
            onClick={() => scrollToScene(SCENE_PROGRESS[4])}
            className="absolute left-0 top-0 bottom-0 right-[50%] group cursor-pointer"
            style={{ pointerEvents: "none" }}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-500" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: "inset 80px 0 120px -20px rgba(103,232,249,0.15)" }}
            />
            <div className="absolute bottom-16 left-[20%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-white/50 text-[10px] font-semibold tracking-[0.4em] uppercase">←</span>
            </div>
          </div>
        </div>

        {/* Lab teal tint (z-[21]) */}
        <div ref={labTintRef} className="absolute inset-0 z-[21] pointer-events-none bg-[#001a1a]" style={{ opacity: 0 }} />

        {/* Vignette (z-[22]) */}
        <div
          className="absolute inset-0 z-[22] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 40%, rgba(0,0,5,0.5) 75%, rgba(0,0,10,0.92) 100%)" }}
        />

        {/* Lab spark particles (z-[26]) */}
        <svg ref={labParticlesRef} className="absolute inset-0 z-[26] pointer-events-none mix-blend-screen" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ opacity: 0 }}>
          {labSparks.map((s, i) => {
            const x2 = Math.max(0, Math.min(1000, s.cx + s.driftX))
            return (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill}>
                <animate attributeName="cx" values={`${s.cx};${x2};${s.cx}`} dur={`${s.dur}s`} begin={`-${s.del}s`} repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.2;1.0;0.2" dur={`${s.dur * 0.7}s`} begin={`-${s.del}s`} repeatCount="indefinite" />
              </circle>
            )
          })}
        </svg>

        {/* ── Scene 5: Both Sides (z-[30]) — wrapper opacity+scale via DOM handler */}
        <div
          className="absolute inset-0 z-[30]"
          style={{ opacity: 0, transformOrigin: "center center", willChange: "transform, opacity" }}
        >
          <div ref={bothRef} className="absolute inset-0">
            <Image src="/hero/both-sides.png" alt="" fill sizes="100vw" className="object-cover object-center" />
          </div>

          {/* Click zone 5 — the space window visible in the center background */}
          <div
            ref={zone5Ref}
            onClick={() => scrollToScene(SCENE_PROGRESS[5])}
            className="absolute left-[22%] right-[22%] top-[10%] bottom-[30%] rounded-[12%] group cursor-pointer"
            style={{ pointerEvents: "none" }}
          >
            <div className="absolute inset-0 rounded-[12%] bg-white/0 group-hover:bg-white/5 transition-all duration-500" />
            <div
              className="absolute inset-0 rounded-[12%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: "inset 0 0 80px 10px rgba(167,139,250,0.18), 0 0 50px 4px rgba(167,139,250,0.12)" }}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-white/50 text-[10px] font-semibold tracking-[0.4em] uppercase">vstoupit</span>
            </div>
          </div>
        </div>

        {/* Door pre-charge glow (z-[34]) */}
        <div ref={chargeRef} className="absolute inset-0 z-[34] pointer-events-none" style={{ opacity: 0 }}>
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(103,232,249,0.15) 0%, rgba(167,139,250,0.10) 40%, transparent 70%)",
              animation: "door-charge-pulse 0.8s ease-in-out infinite alternate",
            }}
          />
        </div>

        {/* ── Scene 6: Doors (z-[35]) — click zones unchanged */}
        <div
          ref={doorsRef}
          className="absolute inset-0 z-[35]"
          style={{ opacity: 0, transformOrigin: "center center", pointerEvents: "none" }}
        >
          <Image src="/hero/doors.png" alt="Tři brány — Květy, Hašiš, Extrakty" fill sizes="100vw" className="object-cover object-center" />

          <div className="absolute inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[72%] md:max-w-[1100px] md:aspect-[3/1.7] grid grid-cols-3 gap-0">
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
                  <div className="absolute inset-0 md:inset-x-[8%] md:inset-y-[6%] rounded-t-[50%] bg-white/0 transition-all duration-500 group-hover:bg-white/10" />
                  <div
                    className="absolute inset-0 md:inset-x-[8%] md:inset-y-[6%] rounded-t-[50%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 80px 10px ${glow}, 0 0 60px 4px ${glow}` }}
                  />
                </Link>
              )
            })}
          </div>
        </div>

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
          @keyframes door-charge-pulse {
            from { opacity: 0.4; transform: scale(0.98); }
            to   { opacity: 1.0; transform: scale(1.02); }
          }
        `}</style>
      </div>
    </section>
  )
}
