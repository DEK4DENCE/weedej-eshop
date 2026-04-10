"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Movement {
  id: string
  createdAt: string
  type: "IN" | "OUT" | "RESERVED" | "RELEASED" | "SOLD"
  quantity: number
  reason: string | null
  orderId: string | null
  variant: {
    name: string
    product: { name: string }
  }
}

const TYPE_LABELS: Record<string, { label: string; classes: string }> = {
  IN: { label: "Příjem", classes: "bg-green-100 text-[#2E7D32]" },
  OUT: { label: "Výdej", classes: "bg-red-100 text-red-700" },
  RESERVED: { label: "Rezervováno", classes: "bg-blue-100 text-blue-700" },
  RELEASED: { label: "Uvolněno", classes: "bg-amber-100 text-amber-700" },
  SOLD: { label: "Prodáno", classes: "bg-purple-100 text-purple-700" },
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/inventory/movements")
      .then((r) => r.json())
      .then((data) => {
        setMovements(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/inventory"
          className="flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#212121] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na sklad
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Přehled pohybů skladu</h1>
        <p className="text-sm text-[#6e6e73] mt-1">Historie všech změn zásob</p>
      </div>

      <div className="bg-white rounded-xl border border-[#DEE2E6] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DEE2E6] bg-[#F8F9FA]">
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Datum</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Produkt</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Varianta</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Typ</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Množství</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Důvod</th>
              <th className="text-left px-4 py-3 font-semibold text-[#212121]">Objednávka</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#6e6e73]">
                  Načítám...
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#6e6e73]">
                  Zatím žádné pohyby skladu
                </td>
              </tr>
            ) : (
              movements.map((m) => {
                const typeInfo = TYPE_LABELS[m.type] ?? { label: m.type, classes: "bg-gray-100 text-gray-600" }
                return (
                  <tr
                    key={m.id}
                    className="border-b border-[#DEE2E6] last:border-0 hover:bg-[#F8F9FA] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#515154] whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString("cs-CZ", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-[#212121] font-medium">{m.variant.product.name}</td>
                    <td className="px-4 py-3 text-[#515154]">{m.variant.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.classes}`}
                      >
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#212121] font-mono">{m.quantity}</td>
                    <td className="px-4 py-3 text-[#515154]">{m.reason ?? "—"}</td>
                    <td className="px-4 py-3 text-[#515154] font-mono text-xs">
                      {m.orderId ? (
                        <Link
                          href={`/admin/orders/${m.orderId}`}
                          className="text-[#2E7D32] hover:underline"
                        >
                          {m.orderId.slice(-8).toUpperCase()}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
