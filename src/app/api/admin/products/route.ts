import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await req.json()
  const product = await db.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      categoryId: body.categoryId,
      thcContent: body.thcContent,
      cbdContent: body.cbdContent,
      imageUrls: [],
    },
  })
  return NextResponse.json(product, { status: 201 })
}
