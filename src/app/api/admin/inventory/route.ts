import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const variants = await db.productVariant.findMany({
    include: { product: { select: { name: true } } },
    orderBy: [{ product: { name: "asc" } }, { name: "asc" }],
  })

  return NextResponse.json(variants)
}
