export const revalidate = 300
export const dynamicParams = true

import { cache } from 'react'
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ProductImages } from "@/components/products/ProductImages"
import { ProductDetailClient } from "@/components/products/ProductDetailClient"
import type { Metadata } from "next"
import type { Product } from "@/types/product"
import { BASE_URL } from "@/lib/config"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

const getProduct = cache((slug: string) =>
  db.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true, variants: { orderBy: { isDefault: 'desc' } } },
  })
)

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({ where: { isActive: true }, select: { slug: true } })
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

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
    activeSubstance: (raw as any).activeSubstance ?? undefined,
    sativaPercent: raw.sativaPercent ?? undefined,
    indicaPercent: raw.indicaPercent ?? undefined,
    erpStock: (raw as any).erpStock != null ? Number((raw as any).erpStock) : undefined,
    erpUnit: (raw as any).erpUnit ?? undefined,
    variants: raw.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      variantValue: v.variantValue ?? undefined,
      variantUnit: v.variantUnit ?? undefined,
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
    ...(product.variants.length > 1 ? {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'CZK',
        lowPrice: Math.min(...product.variants.map((v) => Number(v.price))).toFixed(2),
        highPrice: Math.max(...product.variants.map((v) => Number(v.price))).toFixed(2),
        offerCount: product.variants.length,
        offers: product.variants.map((v) => ({
          '@type': 'Offer',
          name: v.name,
          price: Number(v.price).toFixed(2),
          priceCurrency: 'CZK',
          availability: v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'Weedej' },
        })),
      },
    } : defaultVariant ? {
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

  const breadcrumbItems: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Domů', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Produkty', item: `${BASE_URL}/products` },
  ]
  if (product.category) {
    breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: product.category.name, item: `${BASE_URL}/categories/${product.category.slug}` })
  }
  breadcrumbItems.push({ '@type': 'ListItem', position: breadcrumbItems.length + 1, name: product.name, item: `${BASE_URL}/products/${product.slug}` })

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6e6e73] mb-4">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href="/" className="hover:text-[#2E7D32] transition-colors">Domů</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/products" className="hover:text-[#2E7D32] transition-colors">Produkty</Link></li>
            {product.category && (
              <>
                <li aria-hidden="true">/</li>
                <li><Link href={`/categories/${product.category.slug}`} className="hover:text-[#2E7D32] transition-colors">{product.category.name}</Link></li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[#1d1d1f] font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na produkty
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductImages images={product.imageUrls} productName={product.name} adjustments={raw.imageAdjustments} />
          <ProductDetailClient product={product} />
        </div>

        <div className="mt-12 border border-[#d1d1d6] rounded-xl p-5 bg-[#f5f5f7]">
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            <span className="font-semibold text-[#1d1d1f]">Upozornění: </span>
            Produkt není určený ke konzumaci a kouření. Produkt je určeny výhradně k technickému a průmyslovému využití, například k extrakci, nebo pro výrobu textilií či jiných materiálů z technického konopí. Díky vysoké kvalitě je vhodný pro zpracování ve specializovaných dílnách.
          </p>
        </div>
      </div>
    </>
  )
}