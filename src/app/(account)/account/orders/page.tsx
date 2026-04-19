export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { OrderCard } from "@/components/orders/OrderCard"
import { redirect } from "next/navigation"

export const metadata = { title: "Objednávky — Weedej", robots: { index: false, follow: false } }

export default async function OrdersPage() {
  const session = await auth()
  const userId = (session?.user as any)?.id as string | undefined
  if (!userId) redirect("/login")

  let orders: any[] = []
  let dbError = false
  try {
    orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true, imageUrls: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    dbError = true
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-playfair">Historie objednávek</h1>
      {dbError ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Objednávky se nepodařilo načíst. Zkuste to prosím za chvíli.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Zatím žádné objednávky</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order as any} />
          ))}
        </div>
      )}
    </div>
  )
}