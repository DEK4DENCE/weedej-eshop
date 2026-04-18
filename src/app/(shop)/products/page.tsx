export const revalidate = 60

import { Suspense } from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductFilters } from "@/components/products/ProductFilters"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"
import type { Product } from "@/types/product"
import { BASE_URL } from "@/lib/config"

export const metadata: Metadata = {
  title: "Produkty — Weedej",
  description: "Prémiové CBD produkty — květy, extrakty, edibles. Doručení po celé ČR. Laboratořemi testováno.",
  alternates: { canonical: `${BASE_URL}/products` },
  openGraph: {
    title: "Produkty — Weedej",
    description: "Prohlédněte si kompletní nabídku prémiových CBD produktů.",
    locale: "cs_CZ",
  },
}

interface Props {
  searchParams: Promise<{
    category?: string | string[]
    search?: string
    sort?: string
    page?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    strainType?: string | string[]
    substance?: string | string[]
    terpene?: string | string[]
    effect?: string | string[]
  }>
}

async function fetchProducts(params: Awaited<Props["searchParams"]>): Promise<Product[]> {
  const where: any = { isActive: true }

  if (params.category) {
    const slugs = Array.isArray(params.category) ? params.category : [params.category]
    const cats = await db.category.findMany({ where: { slug: { in: slugs } }, select: { id: true } })
    if (cats.length > 0) where.categoryId = { in: cats.map((c) => c.id) }
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ]
  }

  if (params.minPrice || params.maxPrice) {
    where.basePrice = {}
    if (params.minPrice) where.basePrice.gte = parseFloat(params.minPrice)
    if (params.maxPrice) where.basePrice.lte = parseFloat(params.maxPrice)
  }

  if (params.strainType) {
    const strains = Array.isArray(params.strainType) ? params.strainType : [params.strainType]
    where.strainType = { in: strains }
  }

  if (params.substance) {
    const substances = Array.isArray(params.substance) ? params.substance : [params.substance]
    where.activeSubstance = { in: substances }
  }

  // Default: show only in-stock products. Explicitly set inStock=false to show all.
  if (params.inStock !== 'false') {
    where.variants = { some: { stock: { gt: 0 } } }
  }

  if (params.terpene) {
    const terpenes = Array.isArray(params.terpene) ? params.terpene : [params.terpene]
    where.terpenes = { hasSome: terpenes }
  }

  if (params.effect) {
    const effects = Array.isArray(params.effect) ? params.effect : [params.effect]
    where.effects = { hasSome: effects }
  }

  const products = await db.product.findMany({
    where,
    include: {
      category: true,
      variants: { orderBy: { isDefault: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 48,
  })

  // A product is "in stock" if any variant has stock > 0 OR ERP reports stock > 0
  const isProductInStock = (p: typeof products[0]) =>
    p.variants.some((v) => v.stock > 0) || Number((p as any).erpStock ?? 0) > 0

  // Always show in-stock products first
  const inStock = products.filter(isProductInStock)
  const outOfStock = products.filter((p) => !isProductInStock(p))
  const sorted = [...inStock, ...outOfStock]

  return sorted.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    thcContent: p.thcContent ? Number(p.thcContent) : undefined,
    cbdContent: p.cbdContent ? Number(p.cbdContent) : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    variants: p.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      variantValue: v.variantValue ?? undefined,
      variantUnit: v.variantUnit ?? undefined,
      sku: v.sku ?? undefined,
    })),
    category: {
      ...p.category,
      description: p.category.description ?? undefined,
      imageUrl: p.category.imageUrl ?? undefined,
      icon: p.category.icon ?? undefined,
    },
    shortDescription: p.shortDescription ?? undefined,
    strainType: p.strainType ?? undefined,
    activeSubstance: (p as any).activeSubstance ?? undefined,
    sativaPercent: p.sativaPercent !== null ? p.sativaPercent : undefined,
    indicaPercent: p.indicaPercent !== null ? p.indicaPercent : undefined,
    erpStock: (p as any).erpStock != null ? Number((p as any).erpStock) : undefined,
    erpUnit: (p as any).erpUnit ?? undefined,
  })) as Product[]
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const products = await fetchProducts(params)

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-60 shrink-0">
          <Suspense fallback={
            <div className="space-y-3">
              {Array.from({length: 5}).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          }>
            <ProductFilters />
          </Suspense>
        </aside>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#6e6e73] mb-3">
            Nalezeno <span className="font-semibold text-[#1d1d1f]">{products.length}</span> produktů
          </p>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
}