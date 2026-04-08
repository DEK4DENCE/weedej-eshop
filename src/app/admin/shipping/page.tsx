import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ShippingAdminClient } from "@/components/admin/ShippingAdminClient"

export const dynamic = "force-dynamic"

export default async function ShippingAdminPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") redirect("/")

  const methods = await db.shippingMethod.findMany({ orderBy: { sortOrder: "asc" } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Doprava</h1>
        <p className="text-muted-foreground text-sm mt-1">Správa způsobů doručení</p>
      </div>
      <ShippingAdminClient initialMethods={methods.map((m) => ({ ...m, price: Number(m.price), freeThreshold: m.freeThreshold != null ? Number(m.freeThreshold) : null }))} />
    </div>
  )
}
