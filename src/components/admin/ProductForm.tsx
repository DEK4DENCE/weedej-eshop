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
import { Loader2, Plus, Trash2 } from "lucide-react"
import { ProductImages } from "@/components/admin/ProductImages"

interface Category { id: string; name: string }
interface Variant {
  id?: string
  name: string
  weight: string
  price: number | string
  stock: number
  isDefault: boolean
  isActive: boolean
  _delete?: boolean
}
interface Product {
  id: string; name: string; slug: string; description: string | null
  categoryId: string | null; thcContent: number | null; cbdContent: number | null
  sativaPercent?: number | null; indicaPercent?: number | null
  isActive: boolean; variants: Variant[]; imageUrls?: string[]; imageAdjustments?: string | null
}

function calcStrainType(sativa: number, indica: number, cbd: number): string {
  if (cbd > 1) return 'CBD'
  const minority = Math.min(sativa, indica)
  if (minority > 20) return 'HYBRID'
  return sativa >= indica ? 'SATIVA' : 'INDICA'
}

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
  const [sativaPercent, setSativaPercent] = useState(product?.sativaPercent != null ? String(product.sativaPercent) : "")
  const [indicaPercent, setIndicaPercent] = useState(product?.indicaPercent != null ? String(product.indicaPercent) : "")

  const autoStrainType = sativaPercent !== "" && indicaPercent !== ""
    ? calcStrainType(Number(sativaPercent), Number(indicaPercent), Number(cbdContent) || 0)
    : null

  function handleSativaChange(val: string) {
    setSativaPercent(val)
    const s = Number(val)
    if (!isNaN(s) && s >= 0 && s <= 100) setIndicaPercent(String(100 - s))
  }

  function handleIndicaChange(val: string) {
    setIndicaPercent(val)
    const i = Number(val)
    if (!isNaN(i) && i >= 0 && i <= 100) setSativaPercent(String(100 - i))
  }
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.map((v) => ({ ...v, isDefault: v.isDefault ?? false, isActive: v.isActive ?? true })) ?? []
  )

  const addVariant = () => {
    setVariants((prev) => [...prev, { name: "", weight: "", price: "", stock: 0, isDefault: false, isActive: true }])
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, _delete: true } : v))
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number | boolean) => {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        categoryId: categoryId || null,
        thcContent: thcContent ? Number(thcContent) : null,
        cbdContent: cbdContent ? Number(cbdContent) : null,
        sativaPercent: sativaPercent !== "" ? Number(sativaPercent) : null,
        indicaPercent: indicaPercent !== "" ? Number(indicaPercent) : null,
        strainType: autoStrainType ?? undefined,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          weight: v.weight,
          price: Number(v.price),
          stock: Number(v.stock),
          isDefault: v.isDefault,
          isActive: v.isActive,
          _delete: v._delete ?? false,
        })),
      }
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

  const visibleVariants = variants.filter((v) => !v._delete)

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
              <Label htmlFor="thc">THC % (nepovinné)</Label>
              <Input id="thc" type="number" step="0.01" min="0" max="100" value={thcContent} onChange={(e) => setThcContent(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cbd">CBD % (nepovinné)</Label>
              <Input id="cbd" type="number" step="0.01" min="0" max="100" value={cbdContent} onChange={(e) => setCbdContent(e.target.value)} />
            </div>
          </div>

          {/* Sativa / Indica ratio */}
          <div className="border border-[#DEE2E6] rounded-2xl p-4 bg-[#F8F9FA] space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-[#1d1d1f]">Poměr Sativa / Indica</Label>
              {autoStrainType && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  autoStrainType === 'SATIVA' ? 'bg-green-100 text-green-700' :
                  autoStrainType === 'INDICA' ? 'bg-purple-100 text-purple-700' :
                  autoStrainType === 'HYBRID' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  → {autoStrainType}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6e6e73]">
              Sativa + Indica musí dávat 100 %. Při změně jedné hodnoty se druhá doplní automaticky.
              Pravidlo: &gt;80% jedné složky = čistá odrůda, 21–79 % = Hybrid, CBD &gt;1 % = CBD kategorie.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sativa" className="text-sm text-green-700 font-medium">Sativa %</Label>
                <Input
                  id="sativa"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={sativaPercent}
                  onChange={(e) => handleSativaChange(e.target.value)}
                  placeholder="např. 80"
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indica" className="text-sm text-purple-700 font-medium">Indica %</Label>
                <Input
                  id="indica"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={indicaPercent}
                  onChange={(e) => handleIndicaChange(e.target.value)}
                  placeholder="např. 20"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>
            {sativaPercent !== "" && indicaPercent !== "" && Number(sativaPercent) + Number(indicaPercent) !== 100 && (
              <p className="text-xs text-red-500">⚠ Součet musí být 100 % (aktuálně {Number(sativaPercent) + Number(indicaPercent)} %)</p>
            )}
          </div>

          {/* Variants section */}
          <div className="border border-[#DEE2E6] rounded-2xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Varianty produktu</Label>
              <Button type="button" size="sm" variant="outline" onClick={addVariant} className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#f0faf0]">
                <Plus className="h-4 w-4 mr-1" />Přidat variantu
              </Button>
            </div>

            {visibleVariants.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Žádné varianty. Přidejte variantu s cenou a skladem.</p>
            )}

            {variants.map((variant, index) => {
              if (variant._delete) return null
              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-[#F8F9FA] rounded-xl border border-[#DEE2E6]">
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Název</Label>
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(index, "name", e.target.value)}
                      placeholder="např. Standard"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Váha</Label>
                    <Input
                      value={variant.weight}
                      onChange={(e) => updateVariant(index, "weight", e.target.value)}
                      placeholder="3.5g"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Cena (CZK)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, "price", e.target.value)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Sklad</Label>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-3 pb-1">
                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={variant.isDefault}
                        onChange={(e) => updateVariant(index, "isDefault", e.target.checked)}
                        className="accent-[#2E7D32]"
                      />
                      Výchozí
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={variant.isActive}
                        onChange={(e) => updateVariant(index, "isActive", e.target.checked)}
                        className="accent-[#2E7D32]"
                      />
                      Aktivní
                    </label>
                  </div>
                  <div className="col-span-1 flex justify-end pb-1">
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Smazat variantu"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : product ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Zrušit</Button>
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
