/**
 * GET /api/admin/inventory
 *
 * Returns full inventory summary from ERP for the admin inventory page.
 * Fetches live data from ERP /api/external/inventory on every request.
 * Falls back with an error message if ERP is unreachable.
 *
 * Response: { items: ErpInventoryItem[], _meta: { source, count?, error? } }
 */

import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"
import { getErpConfig, getErpInventory } from "@/lib/erp"

export const dynamic = "force-dynamic"

export async function GET() {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  try {
    const erpConfig = await getErpConfig()
    if (!erpConfig) {
      return NextResponse.json({
        items: [],
        _meta: {
          source: "unconfigured",
          error: "ERP není nakonfigurováno — nastav ERP URL a API klíč v Nastavení → Propojení s ERP.",
        },
      })
    }

    const items = await getErpInventory()
    return NextResponse.json({
      items,
      _meta: { source: "erp", count: items.length },
    })
  } catch (err: any) {
    console.error("[Admin Inventory] ERP fetch failed:", err?.message)
    return NextResponse.json({
      items: [],
      _meta: {
        source: "error",
        error: `ERP nedostupné: ${err?.message ?? "neznámá chyba"}`,
      },
    })
  }
}
