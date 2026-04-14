"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils/formatPrice"

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  erpOrderNumber: string | null
  user: { name: string | null; email: string }
}

const statusColors: Record<string, string> = {
  PENDING:          "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PROCESSING:       "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PACKED:           "bg-orange-500/20 text-orange-400 border-orange-500/30",
  SHIPPED:          "bg-purple-500/20 text-purple-400 border-purple-500/30",
  OUT_FOR_DELIVERY: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  DELIVERED:        "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED:        "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED:         "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState("")

  async function fetchOrders() {
    setLoading(true)
    const res = await fetch("/api/admin/orders")
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  async function handleSyncErp() {
    setSyncing(true)
    setSyncMsg("")
    try {
      const res = await fetch("/api/admin/erp/sync-orders", { method: "POST" })
      const data = await res.json()
      setSyncMsg(data.message ?? "Sync dokončen")
      await fetchOrders()
    } catch {
      setSyncMsg("Chyba při synchronizaci")
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-playfair">Orders</h1>
        <Button
          onClick={handleSyncErp}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Synchronizuji..." : "Sync ze ERP"}
        </Button>
      </div>

      {syncMsg && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          {syncMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Načítání...</div>
      ) : (
        <div className="rounded-md border border-border/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>ERP číslo</TableHead>
                <TableHead>Zákazník</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Celkem</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(-8).toUpperCase()}</TableCell>
                  <TableCell>
                    {order.erpOrderNumber ? (
                      <span className="font-mono text-xs font-semibold text-emerald-600">
                        {order.erpOrderNumber}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{order.user.name ?? order.user.email}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status] ?? ""}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{formatPrice(order.totalAmount / 100)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(order.createdAt).toLocaleDateString("cs-CZ")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/orders/${order.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
