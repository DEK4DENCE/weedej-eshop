import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const movements = await db.stockMovement.findMany({
    include: {
      variant: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  return NextResponse.json(movements)
}
