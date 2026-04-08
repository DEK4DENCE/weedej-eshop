"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import { Loader2 } from "lucide-react"
import { ProductImages } from "@/components/admin/ProductImages"

interface Category { id: string; name: string }
interface Variant { id?: string; name: string; weight: string; price: number | string; stock: number; isActive: boolean }
interface Product { id: string; name: string; slug: string; description: string | null; categoryId: string | null; thcContent: number | null; cbdContent: number | null; isActive: boolean; variants: Variant[]; imageUrls?: string[]; imageAdjustments?: string | null }

interface Props {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(product?.name ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "")
  const [thcContent, setThcContent] = useState(String(product?.thcContent ?? ""))
  const [cbdContent, setCbdContent] = useState(String(product?.cbdContent ?? ""))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { name, slug: slug || name.toLowerCase().replace(/\s+/g, "-"), description, categoryId: categoryId || null, thcContent: thcContent ? Number(thcContent) : null, cbdContent: cbdContent ? Number(cbdContent) : null }
      const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to save product")
      toast({ title: product ? "Product updated" : "Product created" })
      router.push("/admin/products")
      router.refresh()
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated from name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(value) => { if (value) setCategoryId(value) }}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thc">THC % (optional)</Label>
              <Input id="thc" type="number" step="0.1" value={thcContent} onChange={(e) => setThcContent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cbd">CBD % (optional)</Label>
              <Input id="cbd" type="number" step="0.1" value={cbdContent} onChange={(e) => setCbdContent(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : product ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Cancel</Button>
          </div>
        </form>

        {/* Images — only shown when editing an existing product */}
        {product?.id && (
          <div className="mt-8 border-t border-[#1F3D1F] pt-6 space-y-3">
            <Label className="text-base font-semibold">Product Images</Label>
            <ProductImages productId={product.id} initialImages={product.imageUrls ?? []} initialAdjustments={product.imageAdjustments} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
