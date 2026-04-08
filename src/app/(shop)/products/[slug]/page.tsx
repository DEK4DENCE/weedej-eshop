export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ProductImages } from "@/components/products/ProductImages"
import { ProductDetailClient } from "@/components/products/ProductDetailClient"
import type { Metadata } from "next"
import type { Product } from "@/types/product"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug, isActive: true } })
  if (!product) return { title: "Product Not Found" }
  return { title: `${product.name} — Weedej` }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const raw = await db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      variants: { orderBy: { isDefault: "desc" } },
    },
  })

  if (!raw) notFound()

  const product: Product = {
    ...raw,
    basePrice: Number(raw.basePrice),
    thcContent: raw.thcContent ? Number(raw.thcContent) : undefined,
    cbdContent: raw.cbdContent ? Number(raw.cbdContent) : undefined,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    shortDescription: raw.shortDescription ?? undefined,
    strainType: raw.strainType ?? undefined,
    variants: raw.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      weightGrams: v.weightGrams ?? undefined,
      sku: v.sku ?? undefined,
    })),
    category: {
      ...raw.category,
      description: raw.category.description ?? undefined,
      imageUrl: raw.category.imageUrl ?? undefined,
      icon: raw.category.icon ?? undefined,
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductImages images={product.imageUrls} productName={product.name} adjustments={raw.imageAdjustments} />
        <ProductDetailClient product={product} />
      </div>
    </div>
  )
}