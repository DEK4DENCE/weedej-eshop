"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface ShippingMethod {
  id?: string
  name: string
  description: string
  price: number | string
  freeThreshold: number | string | null
  isActive: boolean
  estimatedDays: string
  sortOrder: number
}

interface Props {
  method?: ShippingMethod
  onSave: () => void
  onCancel: () => void
}

export function ShippingMethodForm({ method, onSave, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(method?.name ?? "")
  const [description, setDescription] = useState(method?.description ?? "")
  const [price, setPrice] = useState(String(method?.price ?? ""))
  const [freeThreshold, setFreeThreshold] = useState(method?.freeThreshold != null ? String(method.freeThreshold) : "")
  const [isActive, setIsActive] = useState(method?.isActive ?? true)
  const [estimatedDays, setEstimatedDays] = useState(method?.estimatedDays ?? "")
  const [sortOrder, setSortOrder] = useState(method?.sortOrder ?? 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        name,
        description,
        price: Number(price),
        freeThreshold: freeThreshold !== "" ? Number(freeThreshold) : null,
        isActive,
        estimatedDays,
        sortOrder: Number(sortOrder),
      }
      const url = method?.id ? `/api/admin/shipping/${method.id}` : "/api/admin/shipping"
      const res = await fetch(url, {
        method: method?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Uložení selhalo")
      onSave()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sm-name">Název *</Label>
        <Input id="sm-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Doručení kurýrem" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sm-desc">Popis</Label>
        <Textarea id="sm-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Doručení přímo k vám domů" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sm-price">Cena (CZK) *</Label>
          <Input id="sm-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="99" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sm-free">Doprava zdarma od (CZK)</Label>
          <Input id="sm-free" type="number" step="0.01" min="0" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} placeholder="prázdné = nikdy" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sm-days">Odhadovaná doba doručení</Label>
        <Input id="sm-days" value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} placeholder="1–2 pracovní dny" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sm-order">Pořadí</Label>
          <Input id="sm-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-[#2E7D32] w-4 h-4"
            />
            <span className="text-sm font-medium">Aktivní</span>
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-[#2E7D32] hover:bg-[#1a9020] text-white">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ukládám...</> : "Uložit"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Zrušit</Button>
      </div>
    </form>
  )
}
