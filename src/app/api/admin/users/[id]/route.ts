import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError, session } = await requireAdmin()
  if (authError) return authError
  const { id } = await params

  // Prevent self-deletion
  if (session.user.id === id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  // Prevent deleting the last admin
  const targetUser = await db.user.findUnique({ where: { id }, select: { role: true } })
  if (targetUser?.role === 'ADMIN') {
    const adminCount = await db.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last admin account' }, { status: 400 })
    }
  }

  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
