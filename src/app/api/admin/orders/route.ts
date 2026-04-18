import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
export const dynamic = 'force-dynamic'

export async function GET() {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const orders = await db.order.findMany({
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      paidAt: true,
      shippedAt: true,
      deliveredAt: true,
      erpOrderId: true,
      erpOrderNumber: true,
      erpSyncStatus: true,
      erpSyncLastError: true,
      erpSyncAttempts: true,
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  return NextResponse.json(orders)
}
