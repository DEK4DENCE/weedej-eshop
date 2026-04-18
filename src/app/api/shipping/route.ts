import { NextResponse } from "next/server"
import { db } from "@/lib/db"
export const dynamic = 'force-dynamic'

export const revalidate = 300

export async function GET() {
  const methods = await db.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json(methods)
}
