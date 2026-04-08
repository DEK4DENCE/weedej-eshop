import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const patchSchema = z.object({
  fullName: z.string().min(2).optional(),
  line1: z.string().min(3).optional(),
  line2: z.string().optional().nullable(),
  city: z.string().min(1).optional(),
  postalCode: z.string().min(3).optional(),
  country: z.string().length(2).optional(),
  isDefault: z.boolean().optional(),
})

async function getAddress(id: string, userId: string) {
  return db.address.findFirst({ where: { id, userId } })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  const address = await getAddress(id, userId)
  if (!address) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 422 })
  }

  const { isDefault, ...rest } = parsed.data

  if (isDefault) {
    await db.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } })
  }

  const updated = await db.address.update({
    where: { id },
    data: { ...rest, ...(isDefault !== undefined ? { isDefault } : {}) },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  const address = await getAddress(id, userId)
  if (!address) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.address.delete({ where: { id } })

  // If we deleted the default, promote the next address
  if (address.isDefault) {
    const next = await db.address.findFirst({ where: { userId }, orderBy: { id: "asc" } })
    if (next) {
      await db.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  }

  return NextResponse.json({ ok: true })
}
