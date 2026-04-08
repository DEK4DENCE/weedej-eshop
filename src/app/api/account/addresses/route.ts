import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const addressSchema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(3),
  country: z.string().length(2),
  isDefault: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const addresses = await db.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  })
  return NextResponse.json(addresses)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const body = await req.json()
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.flatten() }, { status: 422 })
  }

  const { isDefault, ...rest } = parsed.data
  const existingCount = await db.address.count({ where: { userId } })
  const makeDefault = isDefault || existingCount === 0

  if (makeDefault) {
    await db.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } })
  }

  const address = await db.address.create({
    data: { ...rest, userId, isDefault: makeDefault },
  })
  return NextResponse.json(address, { status: 201 })
}
