import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const revalidate = 300

export async function GET() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { terpenes: true, effects: true },
  })

  const terpeneSet = new Set<string>()
  const effectSet = new Set<string>()

  for (const p of products) {
    for (const t of p.terpenes) if (t.trim()) terpeneSet.add(t.trim())
    for (const e of p.effects) if (e.trim()) effectSet.add(e.trim())
  }

  return NextResponse.json({
    terpenes: Array.from(terpeneSet).sort(),
    effects: Array.from(effectSet).sort(),
  })
}
