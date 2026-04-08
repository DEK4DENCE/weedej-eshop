import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const methods = await db.shippingMethod.findMany({ orderBy: { sortOrder: "asc" } })
  return NextResponse.json(methods)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await req.json()
  const method = await db.shippingMethod.create({
    data: {
      name: body.name,
      description: body.description ?? "",
      price: body.price,
      freeThreshold: body.freeThreshold ?? null,
      isActive: body.isActive ?? true,
      estimatedDays: body.estimatedDays ?? "",
      sortOrder: body.sortOrder ?? 0,
    },
  })
  return NextResponse.json(method, { status: 201 })
}
