import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const body = await req.json()
  const category = await db.category.create({ data: { name: body.name, slug: body.slug } })
  return NextResponse.json(category, { status: 201 })
}
