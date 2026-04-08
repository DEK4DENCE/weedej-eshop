'use client'

import type { ProductVariant } from '@/types/product'
import { formatPrice } from '@/lib/utils/formatPrice'

interface ProductVariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId: string
  onSelect: (variantId: string) => void
}

export function ProductVariantSelector({ variants, selectedVariantId, onSelect }: ProductVariantSelectorProps) {
  if (variants.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-[#515154]">Select Size / Weight</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId
          const isOutOfStock = variant.stock === 0

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant.id)}
              disabled={isOutOfStock}
              className={[
                'flex flex-col items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'border-[#22A829] bg-[#22A829]/10 text-[#1d1d1f]'
                  : isOutOfStock
                  ? 'border-[#d2d2d7] bg-[#f5f5f7] text-[#aeaeb2] opacity-50 cursor-not-allowed line-through'
                  : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#22A829] hover:bg-[#22A829]/5',
              ].join(' ')}
            >
              <span>{variant.name}</span>
              {variant.weightGrams && (
                <span className="text-xs text-[#6e6e73]">{variant.weightGrams}g</span>
              )}
              <span className="text-xs font-bold text-[#b8860b] font-mono mt-0.5">
                {formatPrice(Number(variant.price))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
