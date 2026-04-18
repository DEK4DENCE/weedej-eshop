"use client"

import { useEffect, useState } from "react"
import {
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"

// ─── Typy ─────────────────────────────────────────────────────────────────────

interface ErpInventoryItem {
  productId: string
  productName: string
  unit: string
  price: number
  vatRate: number
  category: { id: string; name: string } | null
  physicalStock: number
  reservedStock: number
  availableStock: number
  expectedQuantity: number
  totalExpectedStock: number
  avgPurchasePrice: number
  totalPurchaseValue: number
  totalSalesValue: number
  stockStatus: "empty" | "low" | "ok"
}

interface Meta {
  source: "erp" | "error" | "unconfigured"
  count?: number
  error?: string
}

type SortField = "name" | "category" | "physical" | "reserved" | "available" | "status"
type SortDir = "asc" | "desc"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatStock(value: number, unit: string): string {
  if (unit === "g" && value >= 1000) return `${(value / 1000).toFixed(3).replace(/\.?0+$/, "")} kg`
  if (unit === "ml" && value >= 1000) return `${(value / 1000).toFixed(3).replace(/\.?0+$/, "")} l`
  const rounded = Math.round(value * 1000) / 1000
  return `${rounded} ${unit}`
}


function statusOrder(s: "empty" | "low" | "ok"): number {
  return s === "empty" ? 0 : s === "low" ? 1 : 2
}

// ─── Badges ───────────────────────────────────────────────────────────────────


function StatusBadge({ status }: { status: "empty" | "low" | "ok" }) {
  if (status === "empty")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <AlertTriangle className="h-3 w-3" /> Prázdný
      </span>
    )
  if (status === "low")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <Clock className="h-3 w-3" /> Nízký stav
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-[#2E7D32]">
      <CheckCircle2 className="h-3 w-3" /> Skladem
    </span>
  )
}

const COLS = "grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]"

// ─── Komponenta ───────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [items, setItems] = useState<ErpInventoryItem[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  // Filters
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "empty" | "low" | "ok">("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Sort
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const categories = [...new Set(items.map(i => i.category?.name ?? "Bez kategorie"))].sort()

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/inventory")
      if (res.ok) {
        const data = await res.json()
        setItems(data.items ?? [])
        setMeta(data._meta ?? null)
        setLastRefresh(new Date())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-[#c0c0c0]" />
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 text-[#2E7D32]" />
      : <ArrowDown className="h-3 w-3 text-[#2E7D32]" />
  }

  // Filter
  const filtered = items.filter(item => {
    if (search) {
      const q = search.toLowerCase()
      if (!item.productName.toLowerCase().includes(q) && !(item.category?.name ?? "").toLowerCase().includes(q)) return false
    }
    if (filterStatus !== "all" && item.stockStatus !== filterStatus) return false
    if (filterCategory !== "all") {
      const cat = item.category?.name ?? "Bez kategorie"
      if (cat !== filterCategory) return false
    }
    return true
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case "name":          cmp = a.productName.localeCompare(b.productName, "cs"); break
      case "category":      cmp = (a.category?.name ?? "").localeCompare(b.category?.name ?? "", "cs"); break
      case "physical":   cmp = a.physicalStock - b.physicalStock; break
      case "reserved":   cmp = a.reservedStock - b.reservedStock; break
      case "available":  cmp = a.availableStock - b.availableStock; break
      case "status":        cmp = statusOrder(a.stockStatus) - statusOrder(b.stockStatus); break
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  const erpUrl = process.env.NEXT_PUBLIC_ERP_URL ?? ""

  return (
    <div className="space-y-5">

      {/* ── Hlavička ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Správa skladu</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {meta?.source === "erp" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-[#2E7D32]">
                ● Live z ERP ({meta.count} produktů)
              </span>
            )}
            {meta?.source === "error" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                ✕ ERP nedostupné
              </span>
            )}
            {meta?.source === "unconfigured" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                ⚠ ERP není nakonfigurováno
              </span>
            )}
            {lastRefresh && (
              <span className="text-xs text-[#9e9e9e]">
                aktualizováno {lastRefresh.toLocaleTimeString("cs-CZ")}
              </span>
            )}
          </div>
          {meta?.error && (
            <p className="text-xs text-amber-700 mt-1 max-w-lg">{meta.error}</p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {erpUrl && (
            <a
              href={`${erpUrl}/inventory`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-[#DEE2E6] rounded-lg text-[#212121] hover:bg-[#F8F9FA] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Otevřít v ERP
            </a>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-[#2E7D32] text-white rounded-lg hover:bg-[#1a5e1f] disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Načítám…" : "Obnovit"}
          </button>
        </div>
      </div>

      {/* ── Filtry ── */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Hledat produkt nebo kategorii…"
          className="px-3 py-1.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:border-[#2E7D32] bg-white text-[#212121] w-64"
        />

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:border-[#2E7D32] bg-white text-[#212121]"
        >
          <option value="all">Všechny stavy</option>
          <option value="ok">Skladem</option>
          <option value="low">Nízký stav</option>
          <option value="empty">Prázdný</option>
        </select>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:border-[#2E7D32] bg-white text-[#212121]"
        >
          <option value="all">Všechny kategorie</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {(search || filterStatus !== "all" || filterCategory !== "all") && (
          <button
            onClick={() => { setSearch(""); setFilterStatus("all"); setFilterCategory("all") }}
            className="px-3 py-1.5 text-sm border border-[#DEE2E6] rounded-lg text-[#515154] hover:bg-[#F8F9FA] transition-colors"
          >
            ✕ Vymazat filtry
          </button>
        )}

        <span className="ml-auto text-xs text-[#9e9e9e]">
          {sorted.length} / {items.length} produktů
        </span>
      </div>

      {/* ── Tabulka ── */}
      <div className="bg-white rounded-xl border border-[#DEE2E6] overflow-hidden">

        {/* Hlavička */}
        <div className={`grid ${COLS} items-center gap-4 px-4 py-3 bg-[#F8F9FA] border-b border-[#DEE2E6] text-xs font-semibold text-[#515154] select-none`}>
          <button className="flex items-center gap-1 hover:text-[#212121]" onClick={() => toggleSort("name")}>
            Produkt <SortIcon field="name" />
          </button>
          <button className="flex items-center gap-1 justify-center hover:text-[#212121]" onClick={() => toggleSort("category")}>
            Kategorie <SortIcon field="category" />
          </button>
          <button className="flex items-center gap-1 justify-end hover:text-[#212121]" onClick={() => toggleSort("physical")}>
            Skladem <SortIcon field="physical" />
          </button>
          <button className="flex items-center gap-1 justify-end hover:text-[#212121]" onClick={() => toggleSort("reserved")}>
            Rezervováno <SortIcon field="reserved" />
          </button>
          <button className="flex items-center gap-1 justify-end hover:text-[#212121]" onClick={() => toggleSort("available")}>
            Dostupné <SortIcon field="available" />
          </button>
          <button className="flex items-center gap-1 justify-center hover:text-[#212121]" onClick={() => toggleSort("status")}>
            Status <SortIcon field="status" />
          </button>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-[#6e6e73] text-sm flex flex-col items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-[#2E7D32]" />
            Načítám data z ERP…
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#6e6e73] text-sm">
            {items.length === 0 ? "ERP nevrátilo žádné produkty." : "Žádné produkty neodpovídají filtrům."}
          </div>
        ) : (
          sorted.map((item) => {
            return (
              <div key={item.productId} className="border-b border-[#DEE2E6] last:border-0">
                <div className={`grid ${COLS} items-center gap-4 px-4 py-3 hover:bg-[#F8F9FA] transition-colors`}>
                  <div className="font-medium text-[#212121] text-sm truncate pr-2">{item.productName}</div>

                  <div className="text-sm text-[#515154] text-center truncate">
                    {item.category?.name ?? <span className="text-[#c0c0c0]">—</span>}
                  </div>

                  <div className="text-right text-sm font-medium text-blue-600">
                    {formatStock(item.physicalStock, item.unit)}
                  </div>

                  <div className="text-right text-sm">
                    {item.reservedStock > 0
                      ? <span className="text-orange-600 font-medium">{formatStock(item.reservedStock, item.unit)}</span>
                      : <span className="text-[#c0c0c0]">—</span>}
                  </div>

                  <div className="text-right text-sm font-medium">
                    {item.availableStock > 0
                      ? <span className="text-[#2E7D32]">{formatStock(Math.max(0, item.availableStock), item.unit)}</span>
                      : <span className="text-red-600">{formatStock(Math.max(0, item.availableStock), item.unit)}</span>}
                  </div>

                  <div className="flex justify-center">
                    <StatusBadge status={item.stockStatus} />
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Footer součty */}
        {!loading && sorted.length > 0 && (
          <div className={`grid ${COLS} items-center gap-4 px-4 py-3 bg-[#F8F9FA] border-t border-[#DEE2E6] text-xs font-semibold text-[#515154]`}>
            <div className="text-[#9e9e9e] font-normal">{sorted.length} produktů</div>
            <div />
            <div className="text-right text-[#9e9e9e]">—</div>
            <div className="text-right">
              {sorted.some(i => i.reservedStock > 0)
                ? <span className="text-orange-600">{sorted.filter(i => i.reservedStock > 0).length} s rezervací</span>
                : <span className="text-[#9e9e9e]">—</span>}
            </div>
            <div className="text-right">
              <span className={sorted.filter(i => i.availableStock > 0).length === sorted.length ? "text-[#2E7D32]" : "text-[#9e9e9e]"}>
                {sorted.filter(i => i.availableStock > 0).length} dostupných
              </span>
            </div>
            <div />
          </div>
        )}
      </div>

    </div>
  )
}
