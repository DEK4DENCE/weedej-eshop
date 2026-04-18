import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { logAdminAction } from "@/lib/audit"
export const dynamic = 'force-dynamic'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError, session } = await requireAdmin()
  if (authError) return authError
  const { id } = await params

  // Prevent self-deletion
  if (session.user.id === id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  // Prevent deleting the last admin
  const targetUser = await db.user.findUnique({ where: { id }, select: { role: true, email: true } })
  if (targetUser?.role === 'ADMIN') {
    const adminCount = await db.user.count({ where: { role: 'ADMIN' } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last admin account' }, { status: 400 })
    }
  }

  await db.user.delete({ where: { id } })

  await logAdminAction({
    adminId:    session.user.id as string,
    action:     "DELETE_USER",
    entityType: "User",
    entityId:   id,
    oldValue:   { role: targetUser?.role, email: targetUser?.email },
  }).catch((e: unknown) => console.error("[Audit] logAdminAction failed:", e))

  return NextResponse.json({ ok: true })
}
