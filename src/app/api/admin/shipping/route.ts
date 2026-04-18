import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin(req)
  if (authError) return authError
  const methods = await db.shippingMethod.findMany({ orderBy: { sortOrder: "asc" } })
  return NextResponse.json(methods)
}

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin(req)
  if (authError) return authError
  const body = await req.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name || name.length > 100) return NextResponse.json({ error: "name is required (max 100 chars)" }, { status: 400 })
  const price = Number(body.price)
  if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 })
  const method = await db.shippingMethod.create({
    data: {
      name,
      description: typeof body.description === "string" ? body.description.slice(0, 500) : "",
      price,
      freeThreshold: body.freeThreshold != null ? Number(body.freeThreshold) : null,
      isActive: body.isActive ?? true,
      estimatedDays: typeof body.estimatedDays === "string" ? body.estimatedDays.slice(0, 50) : "",
      sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
    },
  })
  return NextResponse.json(method, { status: 201 })
}
