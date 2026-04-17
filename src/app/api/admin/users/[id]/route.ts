import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
