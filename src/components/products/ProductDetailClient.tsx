"use client"

import { useState } from "react"
import { ProductVariantSelector } from "./ProductVariantSelector"
import AddToCartButton from "@/components/cart/AddToCartButton"
import { formatPrice } from "@/lib/utils/formatPrice"
import type { Product } from "@/types/product"

export function ProductDetailClient({ product }: { product: Product }) {
  const defaultVariant = product.variants[0]
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? "")
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? defaultVariant

  return (
    <div className="space-y-6">
      {product.category && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#2E7D32]/30 text-[#2E7D32] bg-[#2E7D32]/10">
          {product.category.name}
        </span>
      )}

      <h1 className="text-4xl font-bold font-playfair text-[#1d1d1f]">{product.name}</h1>

      {(product.thcContent || product.cbdContent) && (
        <div className="flex gap-4 text-sm">
          {product.thcContent && (
            <span className="text-[#2E7D32] font-medium">THC: {product.thcContent}%</span>
          )}
          {product.cbdContent && (
            <span className="text-[#b8860b] font-medium">CBD: {product.cbdContent}%</span>
          )}
        </div>
      )}

      <p className="text-[#515154] leading-relaxed">{product.description}</p>

      {product.variants.length > 0 && (
        <ProductVariantSelector
          variants={product.variants}
          selectedVariantId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />
      )}

      {selectedVariant && (
        <div className="space-y-4">
          {/* Stock status badge */}
          <div>
            {selectedVariant.stock === 0 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                Není skladem
              </span>
            ) : selectedVariant.stock <= 5 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                Posledních {selectedVariant.stock} ks
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-[#2E7D32]">
                Skladem
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-[#b8860b] font-mono">
            {formatPrice(selectedVariant.price)}
          </div>
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant.id}
            productName={product.name}
            variantName={selectedVariant.name}
            price={selectedVariant.price}
            imageUrl={product.imageUrls[0] ?? ""}
            className="!w-full !h-12 !rounded-xl text-sm font-semibold"
          />
        </div>
      )}

      {product.effects.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[#515154] mb-2">Effects</p>
          <div className="flex flex-wrap gap-2">
            {product.effects.map((effect) => (
              <span key={effect} className="px-3 py-1 rounded-full text-xs font-medium bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32]">
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}

      {product.flavours.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[#515154] mb-2">Flavours</p>
          <div className="flex flex-wrap gap-2">
            {product.flavours.map((flavour) => (
              <span key={flavour} className="px-3 py-1 rounded-full text-xs font-medium bg-[#b8860b]/10 border border-[#b8860b]/20 text-[#b8860b]">
                {flavour}
              </span>
            ))}
          </div>
        </div>
      )}

      {product.terpenes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[#515154] mb-2">Terpenes</p>
          <div className="flex flex-wrap gap-2">
            {product.terpenes.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-[#F8F9FA] border border-[#DEE2E6] text-[#515154]">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
