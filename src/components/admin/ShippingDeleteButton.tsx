"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"

interface Props {
  id: string
  name: string
  onDeleted: () => void
}

export function ShippingDeleteButton({ id, name, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Smazání selhalo")
      onDeleted()
    } catch {
      setLoading(false)
      setConfirm(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Smazat &quot;{name}&quot;?</span>
        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading} className="h-7 text-xs px-2">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Ano"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirm(false)} className="h-7 text-xs px-2">Ne</Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={() => setConfirm(true)} className="text-red-500 border-red-200 hover:bg-red-50 h-7 px-2">
      <Trash2 className="h-3 w-3" />
    </Button>
  )
}
