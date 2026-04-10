"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: Date | null
  createdAt: Date
}

export function AdminUsersClient({ users: initial }: { users: User[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleResend = async (id: string) => {
    setLoadingId(id + "_resend")
    try {
      const res = await fetch(`/api/admin/users/${id}/resend-verification`, { method: "POST" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Chyba")
      }
      toast({ title: "Verifikační email byl odeslán" })
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Opravdu smazat účet ${email}? Tato akce je nevratná.`)) return
    setLoadingId(id + "_delete")
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Nepodařilo se smazat účet")
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast({ title: "Účet byl smazán" })
      router.refresh()
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rounded-md border border-border/40">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Jméno</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Ověřen</TableHead>
            <TableHead>Registrace</TableHead>
            <TableHead className="text-right">Akce</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.emailVerified ? "default" : "outline"}>
                  {user.emailVerified ? "Ano" : "Ne"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(user.createdAt).toLocaleDateString("cs-CZ")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {!user.emailVerified && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResend(user.id)}
                      disabled={loadingId === user.id + "_resend"}
                      className="h-7 px-2 text-xs border-[#DEE2E6] text-[#2E7D32] hover:bg-[#f0faf0]"
                      title="Znovu odeslat verifikační email"
                    >
                      {loadingId === user.id + "_resend" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <><Mail className="h-3 w-3 mr-1" />Ověřit</>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={loadingId === user.id + "_delete"}
                    className="h-7 px-2 text-xs border-[#DEE2E6] text-red-500 hover:bg-red-50 hover:border-red-200"
                    title="Smazat účet"
                  >
                    {loadingId === user.id + "_delete" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
