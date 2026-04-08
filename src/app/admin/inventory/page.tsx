"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Package, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

interface VariantRow {
  id: string
  name: string
  sku: string | null
  stock: number
  product: { name: string }
}

export default function InventoryPage() {
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [form, setForm] = useState<{ type: "IN" | "OUT"; quantity: string; reason: string }>({
    type: "IN",
    quantity: "",
    reason: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function fetchVariants() {
    setLoading(true)
    const res = await fetch("/api/admin/inventory")
    if (res.ok) {
      const data = await res.json()
      setVariants(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchVariants()
  }, [])

  async function handleAdjust(variantId: string) {
    setError("")
    setSuccess("")
    const qty = parseInt(form.quantity, 10)
    if (!qty || qty <= 0) {
      setError("Enter a valid positive quantity")
      return
    }
    const res = await fetch("/api/admin/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, type: form.type, quantity: qty, reason: form.reason }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Failed to adjust stock")
      return
    }
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, stock: data.stock } : v))
    )
    setSuccess(`Stock updated successfully`)
    setAdjusting(null)
    setForm({ type: "IN", quantity: "", reason: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Inventory Management</h1>
          <p className="text-sm text-[#6e6e73] mt-1">Manage stock levels for all product variants</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/inventory/movements"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#DEE2E6] rounded-lg text-[#212121] hover:bg-[#F8F9FA] transition-colors"
          >
            <Package className="h-4 w-4" />
            Movement Log
          </Link>
          <button
            onClick={fetchVariants}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#2E7D32] text-white rounded-lg hover:bg-[#1a5e1f] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DEE2E6] bg-[#F8F9FA]">
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Product</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Variant</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">SKU</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Current Stock</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#6e6e73]">
                  Loading...
                </td>
              </tr>
            ) : variants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#6e6e73]">
                  No variants found
                </td>
              </tr>
            ) : (
              variants.map((variant) => (
                <>
                  <tr
                    key={variant.id}
                    className="border-b border-[#DEE2E6] last:border-0 hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#212121] font-medium">{variant.product.name}</td>
                    <td className="px-4 py-3 text-[#515154]">{variant.name}</td>
                    <td className="px-4 py-3 text-[#515154] font-mono text-xs">{variant.sku ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          variant.stock === 0
                            ? "bg-red-100 text-red-700"
                            : variant.stock <= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-[#2E7D32]"
                        }`}
                      >
                        {variant.stock} ks
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setAdjusting(adjusting === variant.id ? null : variant.id)
                          setError("")
                          setSuccess("")
                          setForm({ type: "IN", quantity: "", reason: "" })
                        }}
                        className="px-3 py-1.5 text-xs font-medium border border-[#2E7D32] text-[#2E7D32] rounded-lg hover:bg-[#2E7D32] hover:text-white transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                  {adjusting === variant.id && (
                    <tr key={`${variant.id}-form`} className="bg-[#F8F9FA] border-b border-[#DEE2E6]">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-[#515154]">Type</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setForm((f) => ({ ...f, type: "IN" }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                  form.type === "IN"
                                    ? "bg-green-100 border-[#2E7D32] text-[#2E7D32]"
                                    : "border-[#DEE2E6] text-[#515154] hover:bg-white"
                                }`}
                              >
                                <TrendingUp className="h-3 w-3" /> Stock In
                              </button>
                              <button
                                onClick={() => setForm((f) => ({ ...f, type: "OUT" }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                  form.type === "OUT"
                                    ? "bg-red-50 border-red-400 text-red-600"
                                    : "border-[#DEE2E6] text-[#515154] hover:bg-white"
                                }`}
                              >
                                <TrendingDown className="h-3 w-3" /> Stock Out
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-[#515154]">Quantity</label>
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
                            <label className="text-xs font-medium text-[#515154]">Reason (optional)</label>
                            <input
                              type="text"
                              value={form.reason}
                              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                              placeholder="e.g. New shipment, damaged goods..."
                              className="w-full px-3 py-1.5 text-sm border border-[#DEE2E6] rounded-lg focus:outline-none focus:border-[#2E7D32] bg-white text-[#212121]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAdjust(variant.id)}
                              className="px-4 py-1.5 text-xs font-medium bg-[#2E7D32] text-white rounded-lg hover:bg-[#1a5e1f] transition-colors"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => {
                                setAdjusting(null)
                                setError("")
                              }}
                              className="px-4 py-1.5 text-xs font-medium border border-[#DEE2E6] text-[#515154] rounded-lg hover:bg-white transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
