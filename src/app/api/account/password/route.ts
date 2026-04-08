import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { comparePassword, hashPassword } from "@/lib/utils/hashPassword"
import { z } from "zod"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  const user = await db.user.findUnique({ where: { id: (session.user as any).id } })
  if (!user?.passwordHash) return NextResponse.json({ error: "No password set" }, { status: 400 })
  const valid = await comparePassword(parsed.data.currentPassword, user.passwordHash)
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  })
  return NextResponse.json({ success: true })
}
