export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react"
import { formatPrice } from "@/lib/utils/formatPrice"

export const metadata = { title: "Admin Dashboard — Weedej" }

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount, revenueData] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" } } }),
  ])

  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  })

  const stats = [
    { title: "Celkem produktů", value: productCount, icon: Package, color: "text-green-400" },
    { title: "Celkem objednávek", value: orderCount, icon: ShoppingCart, color: "text-yellow-400" },
    { title: "Zákazníci", value: userCount, icon: Users, color: "text-blue-400" },
    { title: "Tržby", value: formatPrice((revenueData._sum.totalAmount ?? 0) / 100), icon: DollarSign, color: "text-purple-400" },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-playfair">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Nedávné objednávky</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-medium">{order.user.name ?? order.user.email}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(order.totalAmount / 100)}</p>
                  <p className="text-xs text-muted-foreground">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}