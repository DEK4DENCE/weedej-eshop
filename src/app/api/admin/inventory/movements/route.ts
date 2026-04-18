import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin(req)
  if (authError) return authError

  const movements = await db.stockMovement.findMany({
    include: {
      variant: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  return NextResponse.json(movements)
}
