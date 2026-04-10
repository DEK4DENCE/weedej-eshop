import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  newsletter: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, name: true, email: true, newsletter: true },
  })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  const user = await db.user.update({
    where: { id: (session.user as any).id },
    data: parsed.data,
    select: { id: true, name: true, email: true, newsletter: true },
  })
  return NextResponse.json(user)
}
