// GET /api/admin/erp/diagnose
// Diagnostika ERP integrace — zobrazí co funguje a co ne

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const erpUrl = process.env.ERP_API_URL
  const erpKey = process.env.ERP_API_KEY
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  const result: Record<string, any> = {
    env: {
      ERP_API_URL: erpUrl ? `✅ nastaveno (${erpUrl})` : "❌ CHYBÍ — nastav v Vercel env vars",
      ERP_API_KEY: erpKey ? "✅ nastaveno" : "❌ CHYBÍ — nastav v Vercel env vars",
      STRIPE_WEBHOOK_SECRET: stripeWebhookSecret ? "✅ nastaveno" : "❌ CHYBÍ",
    },
    erpConnectivity: null,
    dbColumns: {},
    orders: {},
  }

  // Test ERP konektivity
  if (erpUrl && erpKey) {
    try {
      const res = await fetch(`${erpUrl}/api/external/products`, {
        headers: { "X-API-Key": erpKey },
        signal: AbortSignal.timeout(5_000),
      })
      result.erpConnectivity = res.ok
        ? `✅ ERP odpovědělo OK (${res.status})`
        : `❌ ERP chyba: HTTP ${res.status}`
    } catch (e: any) {
      result.erpConnectivity = `❌ ERP nedostupné: ${e.message}`
    }
  } else {
    result.erpConnectivity = "⚠️ Přeskočeno — env vars nejsou nastaveny"
  }

  // Test DB sloupců přes raw SQL
  try {
    const cols = await db.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Order'
      AND column_name IN ('erpOrderId', 'erpOrderNumber', 'id', 'status')
    `
    const found = cols.map((c) => c.column_name)
    result.dbColumns = {
      erpOrderId: found.includes("erpOrderId") ? "✅ existuje" : "❌ CHYBÍ — spusť SQL migraci",
      erpOrderNumber: found.includes("erpOrderNumber") ? "✅ existuje" : "❌ CHYBÍ — spusť SQL migraci",
    }
  } catch (e: any) {
    result.dbColumns = { error: e.message }
  }

  // Statistiky objednávek
  try {
    const [total, withErp, withoutErp] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { erpOrderId: { not: null } } }).catch(() => -1),
      db.order.count({ where: { erpOrderId: null } }).catch(() => -1),
    ])
    result.orders = { total, withErpId: withErp, withoutErpId: withoutErp }
  } catch (e: any) {
    result.orders = { error: `Nelze načíst — pravděpodobně chybí sloupce v DB: ${e.message}` }
  }

  return NextResponse.json(result, { status: 200 })
}
