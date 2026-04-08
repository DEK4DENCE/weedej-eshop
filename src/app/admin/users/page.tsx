export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const metadata = { title: "Users — Admin" }

export default async function AdminUsersPage() {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } })
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-playfair">Users</h1>
      <div className="rounded-md border border-border/40">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name ?? "—"}</TableCell>
                <TableCell><Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge></TableCell>
                <TableCell><Badge variant={user.emailVerified ? "default" : "outline"}>{user.emailVerified ? "Yes" : "No"}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
