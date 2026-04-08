import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin/AdminNav"
import { Toaster } from "@/components/ui/toaster"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") redirect("/")

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-border/40 bg-background/95">
        <div className="p-6">
          <h2 className="text-lg font-bold font-playfair bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
        <AdminNav />
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
      <Toaster />
    </div>
  )
}
