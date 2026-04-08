import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await req.json()
  const category = await db.category.create({ data: { name: body.name, slug: body.slug } })
  return NextResponse.json(category, { status: 201 })
}
