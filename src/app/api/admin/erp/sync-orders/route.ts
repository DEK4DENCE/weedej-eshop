// POST /api/admin/erp/sync-orders
// Synchronizuje statusy objednávek z ERP zpět do eshopu
// ERP je zdroj pravdy pro statusy: paid → shipped → delivered → cancelled

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpOrder, getErpConfig } from "@/lib/erp"

// ERP status → Eshop OrderStatus
const ERP_TO_ESHOP_STATUS: Record<string, string> = {
  paid:       "PROCESSING",
  processing: "PROCESSING",
  shipped:    "SHIPPED",
  delivered:  "DELIVERED",
  cancelled:  "CANCELLED",
  storno:     "CANCELLED",
}

export async function POST() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const erpConfig = await getErpConfig()
  if (!erpConfig) {
    return NextResponse.json({ error: "ERP není nakonfigurováno — nastav URL a klíč v admin Nastavení" }, { status: 503 })
  }

  // Najdi objednávky propojené s ERP které ještě nejsou hotové
  const pendingOrders = await db.order.findMany({
    where: {
      erpOrderId: { not: null },
      status: { notIn: ["DELIVERED", "CANCELLED", "REFUNDED"] },
    },
    select: { id: true, erpOrderId: true, erpOrderNumber: true, status: true },
  })

  let synced = 0
  let unchanged = 0
  let errors = 0

  for (const order of pendingOrders) {
    try {
      const erpOrder = await getErpOrder({ id: order.erpOrderId! })
      if (!erpOrder) { errors++; continue }

      const newStatus = ERP_TO_ESHOP_STATUS[erpOrder.status]
      if (!newStatus || newStatus === order.status) { unchanged++; continue }

      await db.order.update({
        where: { id: order.id },
        data: { status: newStatus as any },
      })
      synced++
    } catch {
      errors++
    }
  }

  return NextResponse.json({
    message: `Sync dokončen: ${synced} aktualizováno, ${unchanged} beze změny, ${errors} chyb`,
    synced,
    unchanged,
    errors,
    total: pendingOrders.length,
  })
}
