export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Suspense } from "react"
import { ProductGrid } from "@/components/products/ProductGrid"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/types/product"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  await searchParams
  const category = await db.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const rawProducts = await db.product.findMany({
    where: { categoryId: category.id, isActive: true },
    include: {
      category: true,
      variants: { orderBy: { isDefault: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  })

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
      <h1 className="text-3xl font-bold mb-6 font-playfair text-[#F0F5F0]">{category.name}</h1>
      {category.description && (
        <p className="text-[#6B8A6B] mb-8">{category.description}</p>
      )}
      <Suspense fallback={
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      }>
        <ProductGrid products={products} />
      </Suspense>
    </div>
  )
}