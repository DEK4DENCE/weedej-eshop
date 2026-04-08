"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/useToast"

interface Props { id: string }

export function AdminBlogDeleteButton({ id }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this blog post? This cannot be undone.")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Post deleted" })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Could not delete post.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
    </Button>
  )
}
