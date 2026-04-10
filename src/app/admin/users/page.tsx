export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { AdminUsersClient } from "@/components/admin/AdminUsersClient"

export const metadata = { title: "Users — Admin" }

export default async function AdminUsersPage() {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } })
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-playfair">Users</h1>
      <AdminUsersClient users={users} />
    </div>
  )
}
