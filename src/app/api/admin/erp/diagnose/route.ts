// GET /api/admin/erp/diagnose
// Diagnostika ERP integrace — zobrazí co funguje a co ne

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getErpConfig } from "@/lib/erp"

export async function GET() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Načti ERP config (env vars nebo DB settings)
  const erpConfig = await getErpConfig()
  const erpUrlDb = await db.setting.findUnique({ where: { key: "erpApiUrl" } })
  const erpKeyDb = await db.setting.findUnique({ where: { key: "erpApiKey" } })

  const result: Record<string, any> = {
    erpConfig: erpConfig
      ? `✅ nakonfigurováno (URL: ${erpConfig.url})`
      : "❌ CHYBÍ — jdi do admin Nastavení → Propojení s ERP a ulož URL + API klíč",
    envVars: {
      ERP_API_URL: process.env.ERP_API_URL ? `✅ env (${process.env.ERP_API_URL})` : "⚠️ není v env",
      ERP_API_KEY: process.env.ERP_API_KEY ? "✅ env" : "⚠️ není v env",
    },
    dbSettings: {
      erpApiUrl: erpUrlDb?.value ? `✅ DB: ${erpUrlDb.value}` : "❌ není v DB — ulož v admin Nastavení",
      erpApiKey: erpKeyDb?.value ? "✅ DB: uloženo" : "❌ není v DB — ulož v admin Nastavení",
    },
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret ? "✅ nastaveno" : "❌ CHYBÍ v env vars",
    erpConnectivity: null as any,
    dbColumns: {},
    orders: {},
  }

  // Test ERP konektivity
  if (erpConfig) {
    try {
      const res = await fetch(`${erpConfig.url}/api/external/products`, {
        headers: { "X-API-Key": erpConfig.key },
        signal: AbortSignal.timeout(5_000),
      })
      result.erpConnectivity = res.ok
        ? `✅ ERP odpovědělo OK (${res.status})`
        : `❌ ERP chyba: HTTP ${res.status}`
    } catch (e: any) {
      result.erpConnectivity = `❌ ERP nedostupné: ${e.message}`
    }
  } else {
    result.erpConnectivity = "⚠️ Přeskočeno — ERP není nakonfigurováno"
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
      db.order.count({ where: { erpOrderNumber: { not: null } } }).catch(() => -1),
      db.order.count({ where: { erpOrderNumber: null } }).catch(() => -1),
    ])
    result.orders = { total, withErpId: withErp, withoutErpId: withoutErp }
  } catch (e: any) {
    result.orders = { error: `Nelze načíst — pravděpodobně chybí sloupce v DB: ${e.message}` }
  }

  return NextResponse.json(result, { status: 200 })
}
