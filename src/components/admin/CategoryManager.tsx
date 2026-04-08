"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/useToast"
import { Plus, Trash2 } from "lucide-react"

interface Category { id: string; name: string; slug: string }

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)
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
      toast({ title: "Category created" })
      router.refresh()
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Manage Categories</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name" onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
          <Button onClick={handleCreate} disabled={loading} className="bg-green-500 hover:bg-green-600 text-white shrink-0">
            <Plus className="h-4 w-4 mr-1" />Add
          </Button>
        </div>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.slug}</p>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>}
        </div>
      </CardContent>
    </Card>
  )
}
