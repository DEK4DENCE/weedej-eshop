// GET /api/admin/erp/diagnose
// Diagnostika ERP integrace — zobrazí co funguje a co ne

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { db } from "@/lib/db"
import { getErpConfig } from "@/lib/erp"
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin(req)
  if (authError) return authError

  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Načti ERP config (env vars nebo DB settings)
  const erpConfig = await getErpConfig()
  const erpUrlDb = await db.setting.findUnique({ where: { key: "erpApiUrl" } })
  const erpKeyDb = await db.setting.findUnique({ where: { key: "erpApiKey" } })

  const result: Record<string, any> = {
    erpConfig: erpConfig
      ? "✅ nakonfigurováno"
      : "❌ CHYBÍ — jdi do admin Nastavení → Propojení s ERP a ulož URL + API klíč",
    envVars: {
      ERP_API_URL: process.env.ERP_API_URL ? "✅ env" : "⚠️ není v env",
      ERP_API_KEY: process.env.ERP_API_KEY ? "✅ env" : "⚠️ není v env",
    },
    dbSettings: {
      erpApiUrl: erpUrlDb?.value ? "✅ DB: uloženo" : "❌ není v DB — ulož v admin Nastavení",
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
  // Safe: $queryRaw with a tagged template literal — Prisma parameterizes all
  // interpolated values automatically.  No user input is interpolated here;
  // all values are compile-time string literals.  $queryRawUnsafe is NOT used.
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

  // Stripe webhook test — ověřit že secret je nastaven
  result.stripeWebhook = {
    secretSet: !!stripeWebhookSecret,
    diagnosis: stripeWebhookSecret
      ? "✅ STRIPE_WEBHOOK_SECRET je nastaveno v env vars"
      : "❌ STRIPE_WEBHOOK_SECRET chybí v Vercel env vars — webhook vždy vrátí 400, ERP sync se nespustí",
    action: stripeWebhookSecret
      ? "Zkontroluj v Stripe Dashboard → Developers → Webhooks že secret sedí s tímto env varem"
      : "1. Jdi na Stripe Dashboard → Developers → Webhooks\n2. Klikni na endpoint nebo vytvoř nový pro URL: https://tvoje-domena/api/webhooks/stripe\n3. Zkopíruj 'Signing secret' (whsec_...)\n4. Přidej do Vercel env vars jako STRIPE_WEBHOOK_SECRET",
  }

  // Statistiky objednávek + poslední chyby
  try {
    const [total, withErp, pendingSync, syncFailed, recentErrors] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { erpOrderNumber: { not: null } } }).catch(() => -1),
      db.order.count({ where: { erpSyncStatus: "pending_erp_sync" } }).catch(() => -1),
      db.order.count({ where: { erpSyncStatus: "sync_failed" } }).catch(() => -1),
      db.order.findMany({
        where: { erpSyncLastError: { not: null } },
        select: { id: true, erpSyncLastError: true, erpSyncAttempts: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }).catch(() => []),
    ])
    result.orders = {
      total,
      synced: withErp,
      pendingSync,
      syncFailed,
      recentErrors: recentErrors.map((o: any) => ({
        orderId: o.id.slice(-8).toUpperCase(),
        attempts: o.erpSyncAttempts,
        error: o.erpSyncLastError,
      })),
    }
  } catch (e: any) {
    result.orders = { error: `Nelze načíst — pravděpodobně chybí sloupce v DB: ${e.message}` }
  }

  return NextResponse.json(result, { status: 200 })
}
