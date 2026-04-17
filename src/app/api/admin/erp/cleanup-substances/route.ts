// POST /api/admin/erp/cleanup-substances
// One-time: strip (THC-X)/(HHC)/(CBD)/(THC) from product names and assign activeSubstance

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"

const SUBSTANCE_PATTERN = /\s*\((THC-X|THC_X|THC|CBD|HHC)\)\s*/gi

function extractSubstance(name: string): string | null {
  const m = name.match(/\((THC-X|THC_X|THC|CBD|HHC)\)/i)
  if (!m) return null
  const val = m[1].toUpperCase().replace(/-/g, '_')
  return val
}

function cleanName(name: string): string {
  return name.replace(SUBSTANCE_PATTERN, ' ').replace(/\s{2,}/g, ' ').trim()
}

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const products = await db.product.findMany({
    select: { id: true, name: true, activeSubstance: true },
  })

  let cleaned = 0
  let substanceSet = 0

  for (const p of products) {
    const newName = cleanName(p.name)
    const substance = extractSubstance(p.name)
    const nameChanged = newName !== p.name
    const substanceChanged = substance && !p.activeSubstance

    if (nameChanged || substanceChanged) {
      const data: any = {}
      if (nameChanged) data.name = newName
      if (substanceChanged) data.activeSubstance = substance as any
      await db.product.update({ where: { id: p.id }, data })
      if (nameChanged) cleaned++
      if (substanceChanged) substanceSet++
    }
  }

  return NextResponse.json({
    message: `Dokončeno: ${cleaned} názvů opraveno, ${substanceSet} látek přiřazeno.`,
    cleaned,
    substanceSet,
  })
}
