export const dynamic = 'force-dynamic'

import { cache } from 'react'
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ProductImages } from "@/components/products/ProductImages"
import { ProductDetailClient } from "@/components/products/ProductDetailClient"
import type { Metadata } from "next"
import type { Product } from "@/types/product"
import { BASE_URL } from "@/lib/config"

interface Props {
  params: Promise<{ slug: string }>
}

const getProduct = cache((slug: string) =>
  db.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true, variants: { orderBy: { isDefault: 'desc' } } },
  })
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: "Produkt nenalezen — Weedej" }
  const description = product.shortDescription ?? product.description.slice(0, 160)
  const image = product.imageUrls[0]
  return {
    title: `${product.name} — Weedej`,
    description,
    alternates: { canonical: `${BASE_URL}/products/${slug}` },
    openGraph: {
      title: product.name,
      description,
      locale: 'cs_CZ',
      ...(image ? { images: [{ url: image, width: 800, height: 800, alt: product.name }] } : {}),
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const raw = await getProduct(slug)

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
    sativaPercent: raw.sativaPercent ?? undefined,
    indicaPercent: raw.indicaPercent ?? undefined,
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

  const defaultVariant = raw.variants.find((v) => v.isDefault) ?? raw.variants[0]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description.slice(0, 200),
    image: product.imageUrls,
    url: `${BASE_URL}/products/${product.slug}`,
    brand: { '@type': 'Brand', name: 'Weedej' },
    category: product.category.name,
    ...(defaultVariant ? {
      offers: {
        '@type': 'Offer',
        price: Number(defaultVariant.price).toFixed(2),
        priceCurrency: 'CZK',
        availability: defaultVariant.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: `${BASE_URL}/products/${product.slug}`,
        seller: { '@type': 'Organization', name: 'Weedej' },
      },
    } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductImages images={product.imageUrls} productName={product.name} adjustments={raw.imageAdjustments} />
          <ProductDetailClient product={product} />
        </div>
      </div>
    </>
  )
}