export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar } from "lucide-react"

export const metadata = { title: "Account — Weedejna" }

export default async function AccountPage() {
  const session = await auth()
  const user = await db.user.findUnique({
    where: { id: (session!.user as any).id },
    select: { name: true, email: true, role: true, emailVerified: true, createdAt: true },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-playfair">My Account</h1>
      <Card>
        <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <User className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="font-medium">{user?.name ?? "Anonymous"}</p>
              <Badge variant="outline" className="text-xs mt-1">{user?.role}</Badge>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user?.email}</span>
              {user?.emailVerified && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Verified</Badge>}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}