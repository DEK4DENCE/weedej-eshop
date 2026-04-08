"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShippingMethodForm } from "@/components/admin/ShippingMethodForm"
import { ShippingDeleteButton } from "@/components/admin/ShippingDeleteButton"
import { Plus, Pencil, Truck } from "lucide-react"

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  freeThreshold: number | null
  isActive: boolean
  estimatedDays: string
  sortOrder: number
}

interface Props {
  initialMethods: ShippingMethod[]
}

export function ShippingAdminClient({ initialMethods }: Props) {
  const router = useRouter()
  const [methods, setMethods] = useState<ShippingMethod[]>(initialMethods)
  const [editing, setEditing] = useState<ShippingMethod | null>(null)
  const [adding, setAdding] = useState(false)

  const refresh = () => {
    setAdding(false)
    setEditing(null)
    router.refresh()
    fetch("/api/admin/shipping")
      .then((r) => r.json())
      .then((data) => setMethods(data.map((m: any) => ({ ...m, price: Number(m.price), freeThreshold: m.freeThreshold != null ? Number(m.freeThreshold) : null }))))
  }

  return (
    <div className="space-y-4">
      {(adding || editing) && (
        <Card className="border border-[#DEE2E6] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">{editing ? "Upravit způsob dopravy" : "Nový způsob dopravy"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ShippingMethodForm
              method={editing ?? undefined}
              onSave={refresh}
              onCancel={() => { setAdding(false); setEditing(null) }}
            />
          </CardContent>
        </Card>
      )}

      <Card className="border border-[#DEE2E6] rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#2E7D32]" />Způsoby dopravy
          </CardTitle>
          <Button
            size="sm"
            onClick={() => { setAdding(true); setEditing(null) }}
            className="bg-[#2E7D32] hover:bg-[#1a9020] text-white"
          >
            <Plus className="h-4 w-4 mr-1" />Přidat
          </Button>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Žádné způsoby dopravy. Klikněte na Přidat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DEE2E6] text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4 font-medium">Název</th>
                    <th className="text-left py-2 pr-4 font-medium">Cena</th>
                    <th className="text-left py-2 pr-4 font-medium">Zdarma od</th>
                    <th className="text-left py-2 pr-4 font-medium">Doba doručení</th>
                    <th className="text-left py-2 pr-4 font-medium">Pořadí</th>
                    <th className="text-left py-2 pr-4 font-medium">Stav</th>
                    <th className="text-right py-2 font-medium">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((m) => (
                    <tr key={m.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </td>
                      <td className="py-3 pr-4">{m.price} Kč</td>
                      <td className="py-3 pr-4">{m.freeThreshold != null ? `${m.freeThreshold} Kč` : "—"}</td>
                      <td className="py-3 pr-4">{m.estimatedDays}</td>
                      <td className="py-3 pr-4">{m.sortOrder}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {m.isActive ? "Aktivní" : "Neaktivní"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditing(m); setAdding(false) }} className="h-7 px-2">
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <ShippingDeleteButton id={m.id} name={m.name} onDeleted={refresh} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
