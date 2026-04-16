"use client"

import { useEffect, useState, Fragment } from "react"
import Link from "next/link"
import { Package, TrendingUp, TrendingDown, RefreshCw, ChevronDown, ChevronRight } from "lucide-react"

interface VariantRow {
  id: string
  name: string
  sku: string | null
  stock: number
  variantValue: number | null
  variantUnit: string | null
}

interface ProductRow {
  id: string
  name: string
  erpStock: number | null
  erpUnit: string | null
  variants: VariantRow[]
}

function formatErpStock(stock: number | null, unit: string | null): string {
  if (stock == null) return "—"
  const u = unit ?? "ks"
  if (u === "g" && stock >= 1000) return `${(stock / 1000).toFixed(2)} kg`
  if (u === "ml" && stock >= 1000) return `${(stock / 1000).toFixed(2)} l`
  return `${stock} ${u}`
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [form, setForm] = useState<{ type: "IN" | "OUT"; quantity: string; reason: string }>({
    type: "IN",
    quantity: "",
    reason: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function fetchData() {
    setLoading(true)
    const res = await fetch("/api/admin/inventory")
    if (res.ok) {
      const data = await res.json()
      setProducts(data)
      setLastRefresh(new Date())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  function toggleExpand(productId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  async function handleAdjust(variantId: string, productId: string) {
    setError("")
    setSuccess("")
    const qty = parseInt(form.quantity, 10)
    if (!qty || qty <= 0) {
      setError("Zadejte platné kladné číslo")
      return
    }
    const res = await fetch("/api/admin/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, type: form.type, quantity: qty, reason: form.reason }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Nepodařilo se upravit sklad")
      return
    }
    // Aktualizuj stock varianty lokálně
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock: data.stock } : v)) }
          : p
      )
    )
    setSuccess("Sklad byl aktualizován")
    setAdjusting(null)
    setForm({ type: "IN", quantity: "", reason: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Správa skladu</h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            Sklad produktů — data přímo z ERP
            {lastRefresh && (
              <span className="ml-2 text-xs text-[#9e9e9e]">
                · aktualizováno {lastRefresh.toLocaleTimeString("cs-CZ")}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/inventory/movements"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#DEE2E6] rounded-lg text-[#212121] hover:bg-[#F8F9FA] transition-colors"
          >
            <Package className="h-4 w-4" />
            Historie pohybů
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#2E7D32] text-white rounded-lg hover:bg-[#1a5e1f] disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Načítám z ERP…" : "Obnovit z ERP"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-[#2E7D32] text-sm">{success}</div>
      )}

      <div className="bg-white rounded-xl border border-[#DEE2E6] overflow-hidden">
        {/* Hlavička */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-3 bg-[#F8F9FA] border-b border-[#DEE2E6] text-sm font-semibold text-[#212121]">
          <div className="w-5" />
          <div>Produkt</div>
          <div className="text-right pr-8">Sklad ERP</div>
          <div className="w-24 text-center">Varianty</div>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center text-[#6e6e73] text-sm">Načítání...</div>
        ) : products.length === 0 ? (
          <div className="px-4 py-10 text-center text-[#6e6e73] text-sm">Žádné produkty nenalezeny</div>
        ) : (
          products.map((product) => {
            const isOpen = expanded.has(product.id)
            const totalVariantStock = product.variants.reduce((s, v) => s + v.stock, 0)

            return (
              <div key={product.id} className="border-b border-[#DEE2E6] last:border-0">
                {/* Produktový řádek */}
                <div
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                  onClick={() => toggleExpand(product.id)}
                >
                  <div className="w-5 text-[#6e6e73]">
                    {isOpen
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                    }
                  </div>

                  <div className="font-medium text-[#212121]">{product.name}</div>

                  {/* Reálný ERP sklad */}
                  <div className="text-right pr-8">
                    {product.erpStock != null && product.erpUnit ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        product.erpStock === 0
                          ? "bg-red-100 text-red-700"
                          : product.erpStock <= 10
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-[#2E7D32]"
                      }`}>
                        {formatErpStock(product.erpStock, product.erpUnit)}
                      </span>
                    ) : (
                      <span className="text-xs text-[#6e6e73]">
                        {totalVariantStock} ks celkem
                      </span>
                    )}
                  </div>

                  {/* Počet variant */}
                  <div className="w-24 text-center">
                    <span className="text-xs text-[#6e6e73]">
                      {product.variants.length} {product.variants.length === 1 ? "varianta" : product.variants.length < 5 ? "varianty" : "variant"}
                    </span>
                  </div>
                </div>

                {/* Rozbalené varianty */}
                {isOpen && (
                  <div className="bg-[#F8F9FA] border-t border-[#DEE2E6]">
                    {/* Podřádky variant */}
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#DEE2E6]">
                          <th className="text-left pl-10 pr-4 py-2 font-medium text-[#6e6e73] text-xs">Varianta</th>
                          <th className="text-left px-4 py-2 font-medium text-[#6e6e73] text-xs">Velikost</th>
                          <th className="text-left px-4 py-2 font-medium text-[#6e6e73] text-xs">SKU</th>
                          <th className="text-left px-4 py-2 font-medium text-[#6e6e73] text-xs">Skladem</th>
                          <th className="text-left px-4 py-2 font-medium text-[#6e6e73] text-xs">Akce</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variants.map((variant) => (
                          <Fragment key={variant.id}>
                            <tr
                              className="border-b border-[#DEE2E6] last:border-0 hover:bg-white transition-colors"
                            >
                              <td className="pl-10 pr-4 py-2.5 text-[#212121]">{variant.name}</td>
                              <td className="px-4 py-2.5 text-[#515154]">
                                {variant.variantValue != null && variant.variantUnit
                                  ? `${variant.variantValue} ${variant.variantUnit}`
                                  : "—"}
                              </td>
                              <td className="px-4 py-2.5 text-[#515154] font-mono text-xs">{variant.sku ?? "—"}</td>
                              <td className="px-4 py-2.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  variant.stock === 0
                                    ? "bg-red-100 text-red-700"
                                    : variant.stock <= 5
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-[#2E7D32]"
                                }`}>
                                  {variant.stock} ks
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <button
                                  onClick={() => {
                                    setAdjusting(adjusting === variant.id ? null : variant.id)
                                    setError("")
                                    setSuccess("")
                                    setForm({ type: "IN", quantity: "", reason: "" })
                                  }}
                                  className="px-3 py-1 text-xs font-medium border border-[#2E7D32] text-[#2E7D32] rounded-lg hover:bg-[#2E7D32] hover:text-white transition-colors"
                                >
                                  Upravit sklad
                                </button>
                              </td>
                            </tr>

                            {adjusting === variant.id && (
                              <tr className="bg-white border-b border-[#DEE2E6]">
                                <td colSpan={5} className="pl-10 pr-4 py-3">
                                  <div className="flex flex-wrap items-end gap-3">
                                    <div className="flex flex-col gap-1">
                                      <label className="text-xs font-medium text-[#515154]">Typ</label>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => setForm((f) => ({ ...f, type: "IN" }))}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                            form.type === "IN"
                                              ? "bg-green-100 border-[#2E7D32] text-[#2E7D32]"
                                              : "border-[#DEE2E6] text-[#515154] hover:bg-[#F8F9FA]"
                                          }`}
                                        >
                                          <TrendingUp className="h-3 w-3" /> Příjem
                                        </button>
                                        <button
                                          onClick={() => setForm((f) => ({ ...f, type: "OUT" }))}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                            form.type === "OUT"
                                              ? "bg-red-50 border-red-400 text-red-600"
                                              : "border-[#DEE2E6] text-[#515154] hover:bg-[#F8F9FA]"
                                          }`}
                                        >
                                          <TrendingDown className="h-3 w-3" /> Výdej
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <label className="text-xs font-medium text-[#515154]">Množství</label>
                                      <input
                                        type="number"
                                        min={1}
                                        value={form.quantity}
                                        onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                                        placeholder="0"
                                        className="w-24 px-3 py-1.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:border-[#2E7D32] bg-white text-[#212121]"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                      <label className="text-xs font-medium text-[#515154]">Důvod (nepovinné)</label>
                                      <input
                                        type="text"
                                        value={form.reason}
                                        onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                                        placeholder="např. Nová dodávka, poškozené zboží..."
                                        className="w-full px-3 py-1.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:border-[#2E7D32] bg-white text-[#212121]"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleAdjust(variant.id, product.id)}
                                        className="px-4 py-1.5 text-xs font-medium bg-[#2E7D32] text-white rounded-lg hover:bg-[#1a5e1f] transition-colors"
                                      >
                                        Použít
                                      </button>
                                      <button
                                        onClick={() => { setAdjusting(null); setError("") }}
                                        className="px-4 py-1.5 text-xs font-medium border border-[#DEE2E6] text-[#515154] rounded-lg hover:bg-[#F8F9FA] transition-colors"
                                      >
                                        Zrušit
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
