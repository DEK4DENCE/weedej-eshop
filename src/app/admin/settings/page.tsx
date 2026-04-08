import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm"

export const dynamic = "force-dynamic"
export const metadata = { title: "Settings — Admin" }

export default async function AdminSettingsPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") redirect("/")

  const settings = await db.setting.findMany()
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="text-3xl font-bold font-playfair">Settings</h1>
      <AdminSettingsForm settings={map} />
    </div>
  )
}
