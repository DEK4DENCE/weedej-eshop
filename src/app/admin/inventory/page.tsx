"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  Package,
  RefreshCw,
  ChevronDown,
  ChevronRight,
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

type SortField = "name" | "category" | "physical" | "purchaseValue" | "salesValue" | "status"
type SortDir = "asc" | "desc"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatStock(value: number, unit: string): string {
  if (unit === "g" && value >= 1000) return `${(value / 1000).toFixed(3).replace(/\.?0+$/, "")} kg`
  if (unit === "ml" && value >= 1000) return `${(value / 1000).toFixed(3).replace(/\.?0+$/, "")} l`
  const rounded = Math.round(value * 1000) / 1000
  return `${rounded} ${unit}`
}

function formatCzk(value: number): string {
  return value.toLocaleString("cs-CZ", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " Kč"
}

function statusOrder(s: "empty" | "low" | "ok"): number {
  return s === "empty" ? 0 : s === "low" ? 1 : 2
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function StockBadge({ value, unit, status }: { value: number; unit: string; status: "empty" | "low" | "ok" }) {
  const color =
    status === "empty"
      ? "bg-red-100 text-red-700"
      : status === "low"
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-[#2E7D32]"
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {formatStock(value, unit)}
    </span>
  )
}

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

// ─── Komponenta ───────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [items, setItems] = useState<ErpInventoryItem[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-[#9e9e9e]" />
    return sortDir === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-[#2E7D32]" />
      : <ArrowDown className="h-3.5 w-3.5 text-[#2E7D32]" />
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
      case "physical":      cmp = a.physicalStock - b.physicalStock; break
      case "purchaseValue": cmp = a.totalPurchaseValue - b.totalPurchaseValue; break
      case "salesValue":    cmp = a.totalSalesValue - b.totalSalesValue; break
      case "status":        cmp = statusOrder(a.stockStatus) - statusOrder(b.stockStatus); break
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  // Totals
  const totalPurchaseValue = items.reduce((s, i) => s + i.totalPurchaseValue, 0)
  const totalSalesValue    = items.reduce((s, i) => s + i.totalSalesValue, 0)
  const emptyCount         = items.filter(i => i.stockStatus === "empty").length
  const lowCount           = items.filter(i => i.stockStatus === "low").length

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
          <Link
            href="/admin/inventory/movements"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-[#DEE2E6] rounded-lg text-[#212121] hover:bg-[#F8F9FA] transition-colors"
          >
            <Package className="h-4 w-4" />
            Historie pohybů
          </Link>
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

      {/* ── KPI karty ── */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-[#DEE2E6] rounded-xl p-4">
            <p className="text-xs text-[#9e9e9e] uppercase tracking-wide">Produktů</p>
            <p className="text-2xl font-bold text-[#212121] mt-1">{items.length}</p>
          </div>
          <div className="bg-white border border-[#DEE2E6] rounded-xl p-4">
            <p className="text-xs text-[#9e9e9e] uppercase tracking-wide">Nákupní hodnota</p>
            <p className="text-xl font-bold text-[#212121] mt-1">{formatCzk(totalPurchaseValue)}</p>
          </div>
          <div className="bg-white border border-[#DEE2E6] rounded-xl p-4">
            <p className="text-xs text-[#9e9e9e] uppercase tracking-wide">Prodejní hodnota</p>
            <p className="text-xl font-bold text-[#2E7D32] mt-1">{formatCzk(totalSalesValue)}</p>
          </div>
          <div className="bg-white border border-[#DEE2E6] rounded-xl p-4">
            <p className="text-xs text-[#9e9e9e] uppercase tracking-wide">Výstrahy</p>
            <div className="flex items-center gap-2 mt-1">
              {emptyCount > 0 && <span className="text-sm font-bold text-red-600">{emptyCount}× prázdný</span>}
              {lowCount > 0 && <span className="text-sm font-bold text-amber-600">{lowCount}× nízký</span>}
              {emptyCount === 0 && lowCount === 0 && <span className="text-sm font-bold text-[#2E7D32]">Vše OK</span>}
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-[auto_2fr_1.2fr_1fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 bg-[#F8F9FA] border-b border-[#DEE2E6] text-xs font-semibold text-[#515154] select-none">
          <div className="w-5" />
          <button className="flex items-center gap-1 text-left hover:text-[#212121]" onClick={() => toggleSort("name")}>
            Produkt <SortIcon field="name" />
          </button>
          <button className="flex items-center gap-1 hover:text-[#212121]" onClick={() => toggleSort("category")}>
            Kategorie <SortIcon field="category" />
          </button>
          <button className="flex items-center gap-1 justify-end hover:text-[#212121]" onClick={() => toggleSort("physical")}>
            Skladem <SortIcon field="physical" />
          </button>
          <button className="flex items-center gap-1 justify-end hover:text-[#212121]" onClick={() => toggleSort("purchaseValue")}>
            Nák. hodnota <SortIcon field="purchaseValue" />
          </button>
          <button className="flex items-center gap-1 justify-end hover:text-[#212121]" onClick={() => toggleSort("salesValue")}>
            Prod. hodnota <SortIcon field="salesValue" />
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
            const isOpen = expanded.has(item.productId)
            const priceWithVat = item.price * (1 + item.vatRate / 100)
            const avgPurchaseWithVat = item.avgPurchasePrice * (1 + item.vatRate / 100)

            return (
              <div key={item.productId} className="border-b border-[#DEE2E6] last:border-0">

                {/* Hlavní řádek */}
                <div
                  className="grid grid-cols-[auto_2fr_1.2fr_1fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                  onClick={() => toggleExpand(item.productId)}
                >
                  <div className="w-5 text-[#9e9e9e]">
                    {isOpen
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                    }
                  </div>

                  <div className="font-medium text-[#212121] text-sm truncate">{item.productName}</div>

                  <div className="text-sm text-[#515154] truncate">
                    {item.category?.name ?? <span className="text-[#9e9e9e] italic">—</span>}
                  </div>

                  <div className="flex justify-end">
                    <StockBadge value={item.physicalStock} unit={item.unit} status={item.stockStatus} />
                  </div>

                  <div className="text-right text-sm text-[#212121]">
                    {item.totalPurchaseValue > 0 ? formatCzk(item.totalPurchaseValue) : <span className="text-[#9e9e9e]">—</span>}
                  </div>

                  <div className="text-right text-sm font-medium text-[#2E7D32]">
                    {item.totalSalesValue > 0 ? formatCzk(item.totalSalesValue) : <span className="text-[#9e9e9e] font-normal">—</span>}
                  </div>

                  <div className="flex justify-center">
                    <StatusBadge status={item.stockStatus} />
                  </div>
                </div>

                {/* Rozbalený detail */}
                {isOpen && (
                  <div className="bg-[#F8F9FA] border-t border-[#DEE2E6] px-6 py-4 ml-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                      {/* Stavy skladu */}
                      <div>
                        <p className="text-xs font-semibold text-[#515154] uppercase tracking-wide mb-2">Stavy skladu</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6e6e73]">Fyzický sklad (skladem)</span>
                            <StockBadge value={item.physicalStock} unit={item.unit} status={item.stockStatus} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6e6e73]">Rezervováno</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.reservedStock > 0 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {formatStock(item.reservedStock, item.unit)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6e6e73]">Dostupné</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.availableStock > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                            }`}>
                              {formatStock(Math.max(0, item.availableStock), item.unit)}
                            </span>
                          </div>
                          {item.expectedQuantity > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#6e6e73]">Očekáváno</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                +{formatStock(item.expectedQuantity, item.unit)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ceny */}
                      <div>
                        <p className="text-xs font-semibold text-[#515154] uppercase tracking-wide mb-2">Ceny</p>
                        <div className="space-y-2">
                          {item.avgPurchasePrice > 0 && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#6e6e73]">Ø nák. cena bez DPH</span>
                                <span className="text-xs font-medium text-[#212121]">
                                  {item.avgPurchasePrice.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč/{item.unit}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#6e6e73]">Ø nák. cena s DPH</span>
                                <span className="text-xs font-medium text-[#212121]">
                                  {avgPurchaseWithVat.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč/{item.unit}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6e6e73]">Prodejní cena bez DPH</span>
                            <span className="text-xs font-medium text-[#2E7D32]">
                              {item.price.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč/{item.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6e6e73]">Prodejní cena s DPH ({item.vatRate}%)</span>
                            <span className="text-xs font-medium text-[#2E7D32]">
                              {priceWithVat.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč/{item.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hodnoty & akce */}
                      <div>
                        <p className="text-xs font-semibold text-[#515154] uppercase tracking-wide mb-2">Hodnota skladu</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6e6e73]">Nákupní hodnota</span>
                            <span className="text-xs font-medium text-[#212121]">{formatCzk(item.totalPurchaseValue)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#6e6e73]">Prodejní hodnota</span>
                            <span className="text-xs font-semibold text-[#2E7D32]">{formatCzk(item.totalSalesValue)}</span>
                          </div>
                          {item.totalPurchaseValue > 0 && item.totalSalesValue > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#6e6e73]">Potenciální zisk</span>
                              <span className="text-xs font-semibold text-blue-600">
                                {formatCzk(item.totalSalesValue - item.totalPurchaseValue)}
                              </span>
                            </div>
                          )}
                        </div>

                        {erpUrl && (
                          <a
                            href={`${erpUrl}/inventory`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-4 text-xs text-[#2E7D32] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Skladové pohyby v ERP
                          </a>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Footer součty */}
        {!loading && sorted.length > 0 && (
          <div className="grid grid-cols-[auto_2fr_1.2fr_1fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 bg-[#F8F9FA] border-t border-[#DEE2E6] text-sm font-semibold text-[#212121]">
            <div className="w-5" />
            <div className="text-xs text-[#9e9e9e]">{sorted.length} produktů</div>
            <div />
            <div />
            <div className="text-right text-xs">
              {formatCzk(sorted.reduce((s, i) => s + i.totalPurchaseValue, 0))}
            </div>
            <div className="text-right text-xs text-[#2E7D32]">
              {formatCzk(sorted.reduce((s, i) => s + i.totalSalesValue, 0))}
            </div>
            <div />
          </div>
        )}
      </div>

    </div>
  )
}
