"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, RefreshCw, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
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
  erpSyncStatus: string
  erpSyncLastError: string | null
  erpSyncAttempts: number
  user: { name: string | null; email: string }
}

// Status is driven by ERP. Map all variants to the 3 user-facing states.
const STATUS_DISPLAY: Record<string, { label: string; classes: string }> = {
  PENDING:    { label: "Zaplaceno", classes: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  PAID:       { label: "Zaplaceno", classes: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  PROCESSING: { label: "Zaplaceno", classes: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  SHIPPED:    { label: "Odesláno",  classes: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  DELIVERED:  { label: "Doručeno",  classes: "bg-green-500/20 text-green-400 border-green-500/30" },
  CANCELLED:  { label: "Zrušeno",   classes: "bg-red-500/20 text-red-400 border-red-500/30" },
  REFUNDED:   { label: "Vráceno",   classes: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
}

function ErpSyncBadge({ order }: { order: Order }) {
  if (order.erpOrderNumber) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-sm font-semibold text-emerald-600">{order.erpOrderNumber}</span>
        <span className="flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="h-3 w-3" /> synced
        </span>
      </div>
    )
  }
  if (order.erpSyncStatus === "sync_failed") {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</span>
        <span className="flex items-center gap-1 text-xs text-red-500">
          <AlertTriangle className="h-3 w-3" /> sync failed
        </span>
        {order.erpSyncLastError && (
          <span className="text-xs text-red-400 max-w-[200px] truncate" title={order.erpSyncLastError}>
            {order.erpSyncLastError}
          </span>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</span>
      <span className="flex items-center gap-1 text-xs text-yellow-500">
        <Clock className="h-3 w-3" /> pending sync ({order.erpSyncAttempts} pokus)
      </span>
      {order.erpSyncLastError && (
        <span className="text-xs text-yellow-500 max-w-[200px] truncate" title={order.erpSyncLastError}>
          {order.erpSyncLastError}
        </span>
      )}
    </div>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [forceSyncing, setForceSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState("")
  const [syncMsgType, setSyncMsgType] = useState<"info" | "error">("info")

  async function fetchOrders() {
    setLoading(true)
    const res = await fetch("/api/admin/orders")
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  async function handleForceSyncPending() {
    setForceSyncing(true)
    setSyncMsg("")
    try {
      const res = await fetch("/api/admin/erp/force-sync", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setSyncMsg(data.error ?? "Chyba při force sync")
        setSyncMsgType("error")
      } else {
        setSyncMsg(data.message ?? "Force sync dokončen")
        setSyncMsgType(data.failed > 0 ? "error" : "info")
      }
      await fetchOrders()
    } catch (e: any) {
      setSyncMsg(`Chyba: ${e.message}`)
      setSyncMsgType("error")
    } finally {
      setForceSyncing(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const pendingCount = orders.filter(o => o.erpSyncStatus === "pending_erp_sync" || o.erpSyncStatus === "sync_failed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold font-playfair">Objednávky</h1>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button
              onClick={handleForceSyncPending}
              disabled={forceSyncing}
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 ${forceSyncing ? "animate-spin" : ""}`} />
              {forceSyncing ? "Synchronizuji..." : `Sync do ERP (${pendingCount})`}
            </Button>
          )}
        </div>
      </div>

      {syncMsg && (
        <div className={`p-3 rounded-lg border text-sm ${
          syncMsgType === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-blue-50 border-blue-200 text-blue-700"
        }`}>
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
                <TableHead>ERP / Číslo</TableHead>
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
                  <TableCell>
                    <ErpSyncBadge order={order} />
                  </TableCell>
                  <TableCell>{order.user.name ?? order.user.email}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_DISPLAY[order.status]?.classes ?? ""}>{STATUS_DISPLAY[order.status]?.label ?? order.status}</Badge>
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
