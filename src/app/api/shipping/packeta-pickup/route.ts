import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface PacketaPoint {
  id: number | string
  name: string
  nameStreet?: string
  street?: string
  city: string
  zip: string
  country?: string
  type?: string
}

// In-memory cache — revalidated every 6 hours per serverless instance
let cache: PacketaPoint[] | null = null
let cacheAt = 0
const CACHE_TTL = 6 * 60 * 60 * 1000

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

async function fetchPoints(): Promise<PacketaPoint[]> {
  const now = Date.now()
  if (cache && now - cacheAt < CACHE_TTL) return cache

  const password = process.env.PACKETA_API_PASSWORD
  if (!password) throw new Error("PACKETA_API_PASSWORD not set")

  // Packeta REST API v4 — returns full list of pickup points for country
  const url = `https://www.zasilkovna.cz/api/v4/pickup-points?password=${encodeURIComponent(password)}&language=cs&country=cz`
  const res = await fetch(url, { next: { revalidate: 21600 } })
  if (!res.ok) throw new Error(`Packeta API error: ${res.status}`)

  const json = await res.json()
  // Packeta API may return { data: [...] } or [...] directly
  const raw: PacketaPoint[] = Array.isArray(json) ? json : (json.data ?? json.pickupPoints ?? [])
  cache = raw
  cacheAt = now
  return raw
}

export async function GET(req: NextRequest) {
  const q = normalize(req.nextUrl.searchParams.get("q") ?? "")

  try {
    const all = await fetchPoints()

    const results = q.length < 2
      ? all.slice(0, 12)
      : all
          .filter((p) =>
            normalize(p.city).includes(q) ||
            (p.zip ?? "").includes(q) ||
            normalize(p.name).includes(q) ||
            normalize(p.nameStreet ?? p.street ?? "").includes(q)
          )
          .slice(0, 20)

    const points = results.map((p) => ({
      id: String(p.id),
      name: p.name,
      nameStreet: p.nameStreet ?? p.street ?? p.name,
      city: p.city,
      zip: p.zip,
    }))

    return NextResponse.json({ points })
  } catch (err: any) {
    console.error("[PacketaPickup]", err?.message)
    return NextResponse.json({ points: [], error: "Nepodařilo se načíst výdejní místa." }, { status: 503 })
  }
}
