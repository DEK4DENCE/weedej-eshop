"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/useToast"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"

interface Category { id: string; name: string; slug: string }

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleCreate = async () => {
    if (!newName.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newName.toLowerCase().replace(/\s+/g, "-") }),
      })
      if (!res.ok) throw new Error("Failed to create")
      const cat = await res.json()
      setCategories((prev) => [...prev, cat])
      setNewName("")
      toast({ title: "Kategorie vytvořena" })
      router.refresh()
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const updated = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
      toast({ title: "Kategorie uložena" })
      router.refresh()
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Smazat tuto kategorii?")) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast({ title: "Kategorie smazána" })
      router.refresh()
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Správa kategorií</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Název nové kategorie" onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
          <Button onClick={handleCreate} disabled={loading} className="bg-[#2E7D32] hover:bg-[#1a9020] text-white shrink-0">
            <Plus className="h-4 w-4 mr-1" />Přidat
          </Button>
        </div>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 py-2 border-b border-border/40 last:border-0">
              {editingId === cat.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(cat.id); if (e.key === "Escape") setEditingId(null) }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={() => handleSaveEdit(cat.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.slug}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Žádné kategorie</p>}
        </div>
      </CardContent>
    </Card>
  )
}
