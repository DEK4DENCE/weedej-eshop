export const dynamic = 'force-dynamic'

import { Suspense } from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductSearch } from "@/components/products/ProductSearch"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/types/product"

interface Props {
  searchParams: Promise<{ q?: string; search?: string; sort?: string; page?: string }>
}

export const metadata = { title: "Search — Weedej" }

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params.q ?? params.search ?? ""

  const rawProducts = query
    ? await db.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
          variants: { orderBy: { isDefault: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 48,
      })
    : []

  const products: Product[] = rawProducts.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    thcContent: p.thcContent ? Number(p.thcContent) : undefined,
    cbdContent: p.cbdContent ? Number(p.cbdContent) : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    shortDescription: p.shortDescription ?? undefined,
    strainType: p.strainType ?? undefined,
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
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-playfair text-[#F0F5F0]">
        {query ? `Results for "${query}"` : "Search"}
      </h1>
      <div className="mb-6">
        <Suspense>
          <ProductSearch />
        </Suspense>
      </div>
      <ProductGrid
        products={products}
        emptyMessage={query ? `No products found for "${query}"` : "Enter a search term to find products"}
      />
    </div>
  )
}