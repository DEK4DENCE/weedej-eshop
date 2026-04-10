export const dynamic = 'force-dynamic'

import { Suspense } from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductFilters } from "@/components/products/ProductFilters"
import { ProductSearch } from "@/components/products/ProductSearch"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"
import type { Product } from "@/types/product"

export const metadata: Metadata = {
  title: "Produkty — Weedej",
  description: "Prémiové CBD produkty — květy, extrakty, edibles. Doručení po celé ČR. Laboratořemi testováno.",
  alternates: { canonical: "https://weedej-cannabis-eshop-dek4dences-projects.vercel.app/products" },
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

  const products = await db.product.findMany({
    where,
    include: {
      category: true,
      variants: { orderBy: { isDefault: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 48,
  })

  return products.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    thcContent: p.thcContent ? Number(p.thcContent) : undefined,
    cbdContent: p.cbdContent ? Number(p.cbdContent) : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    variants: p.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      weightGrams: v.weightGrams ?? undefined,
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
    sativaPercent: p.sativaPercent !== null ? p.sativaPercent : undefined,
    indicaPercent: p.indicaPercent !== null ? p.indicaPercent : undefined,
  })) as Product[]
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const products = await fetchProducts(params)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-playfair text-[#1d1d1f]">Produkty</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <Suspense>
            <ProductFilters />
          </Suspense>
        </aside>
        <div className="flex-1">
          <div className="mb-4">
            <Suspense>
              <ProductSearch />
            </Suspense>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
}