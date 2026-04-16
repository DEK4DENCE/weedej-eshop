import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const orders = await db.order.findMany({
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      erpOrderId: true,
      erpOrderNumber: true,
      erpSyncStatus: true,
      erpSyncLastError: true,
      erpSyncAttempts: true,
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}
