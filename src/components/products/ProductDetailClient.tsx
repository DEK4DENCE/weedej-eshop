"use client"

import { useState } from "react"
import { ProductVariantSelector } from "./ProductVariantSelector"
import AddToCartButton from "@/components/cart/AddToCartButton"
import { formatPrice } from "@/lib/utils/formatPrice"
import type { Product } from "@/types/product"

const EFFECT_ICONS: Record<string, string> = {
  'Euforický': '😄', 'Kreativní': '✨', 'Energický': '⚡', 'Šťastný': '😊',
  'Veselý': '😄', 'Uvolněný': '😌', 'Hovorný': '💬', 'Soustředěný': '🎯',
  'Povznášející': '🚀', 'Ospalý': '😴', 'Hladový': '🍕',
}
const FLAVOUR_ICONS: Record<string, string> = {
  'Citron': '🍋', 'Pomeranč': '🍊', 'Borůvka': '🫐', 'Borovice': '🌲',
  'Dřevo': '🪵', 'Země': '🌿', 'Ananas': '🍍', 'Tropické': '🌴',
  'Citrus': '🍋', 'Bobule': '🍇', 'Sladký': '🍯', 'Jahoda': '🍓',
  'Vanilka': '🍦', 'Malina': '🫐', 'Broskev': '🍑', 'Koření': '🌶️',
  'Hruška': '🍐', 'Banán': '🍌', 'Čokoláda': '🍫', 'Meloun': '🍈',
  'Máslo': '🧈', 'Mentol': '🌿', 'Diesel': '⛽', 'Skunk': '💨',
  'Pikantní': '🌶️', 'Meruňka': '🍊', 'Limetka': '🍋', 'Ovoce': '🍎',
  'Květiny': '🌸',
}

const SUBSTANCE_STYLES: Record<string, string> = {
  THC_X: 'bg-blue-50 border-blue-300 text-blue-700',
  THC:   'bg-purple-50 border-purple-300 text-purple-700',
  CBD:   'bg-green-50 border-green-300 text-green-700',
  HHC:   'bg-orange-50 border-orange-300 text-orange-700',
}
const SUBSTANCE_LABELS: Record<string, string> = { THC_X: 'THC-X', THC: 'THC', CBD: 'CBD', HHC: 'HHC' }

export function ProductDetailClient({ product }: { product: Product }) {
  const erpStockUnits = Number(product.erpStock ?? 0)

  // Default to the smallest in-stock variant; fall back to smallest overall
  const inStockVariants = product.variants.filter((v) => v.stock > 0)
  const pickSmallest = (arr: typeof product.variants) =>
    arr.length === 0 ? undefined :
    arr.reduce((a, b) =>
      (a.variantValue ?? Infinity) <= (b.variantValue ?? Infinity) ? a : b
    )
  const defaultVariant = pickSmallest(inStockVariants) ?? pickSmallest(product.variants) ?? product.variants[0]
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

      {/* Info badges — each shown independently when data is available */}
      {((product as any).activeSubstance || product.strainType || product.thcContent != null || product.cbdContent != null || (product.sativaPercent != null && product.indicaPercent != null)) && (
        <div className="flex flex-wrap gap-2">
          {(product as any).activeSubstance && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${SUBSTANCE_STYLES[(product as any).activeSubstance] ?? 'bg-gray-50 border-gray-300 text-gray-600'}`}>
              {SUBSTANCE_LABELS[(product as any).activeSubstance] ?? (product as any).activeSubstance}
            </span>
          )}
          {product.strainType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F8F9FA] border border-[#DEE2E6] text-xs font-medium text-[#515154] uppercase tracking-wide">
              {product.strainType}
            </span>
          )}
          {product.thcContent != null && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] text-xs font-medium">
              THC: {product.thcContent}%
            </span>
          )}
          {product.cbdContent != null && product.cbdContent > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#b8860b]/10 border border-[#b8860b]/20 text-[#8B6914] text-xs font-medium">
              CBD: {product.cbdContent}%
            </span>
          )}
          {product.sativaPercent != null && product.indicaPercent != null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8F9FA] border border-[#DEE2E6] text-xs font-medium text-[#515154]">
              <span className="text-green-600">Sativa {product.sativaPercent}%</span>
              <span className="text-[#DEE2E6]">/</span>
              <span className="text-purple-600">Indica {product.indicaPercent}%</span>
            </span>
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
            {selectedVariant.stock === 0 && erpStockUnits === 0 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                Není skladem
              </span>
            ) : selectedVariant.stock > 0 && selectedVariant.stock <= 5 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                Posledních {selectedVariant.stock} ks
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-[#2E7D32]">
                Skladem
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-[#8B6914] font-mono">
            {formatPrice(selectedVariant.price)}
          </div>
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant.id}
            productName={product.name}
            variantName={selectedVariant.name}
            price={selectedVariant.price}
            imageUrl={product.imageUrls[0] ?? ""}
            disabled={selectedVariant.stock === 0 && erpStockUnits === 0}
            className="!w-full !h-12 !rounded-xl text-sm font-semibold"
          />
        </div>
      )}

      {(product.effects.length > 0 || product.flavours.length > 0) && (
        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-[#F0F0F0]">
          {product.effects.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f] mb-3">Top účinky</p>
              <div className="flex flex-col gap-2">
                {product.effects.slice(0, 3).map((effect) => (
                  <div key={effect} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#2E7D32]/8 border border-[#2E7D32]/15">
                    <span className="text-base">{EFFECT_ICONS[effect] ?? '✦'}</span>
                    <span className="text-sm font-medium text-[#2E7D32]">{effect}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {product.flavours.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f] mb-3">Top chutě</p>
              <div className="flex flex-col gap-2">
                {product.flavours.slice(0, 3).map((flavour) => (
                  <div key={flavour} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#b8860b]/8 border border-[#b8860b]/15">
                    <span className="text-base">{FLAVOUR_ICONS[flavour] ?? '◆'}</span>
                    <span className="text-sm font-medium text-[#8B6914]">{flavour}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {product.terpenes.length > 0 && (
        <div className="pt-2 border-t border-[#F0F0F0]">
          <p className="text-sm font-semibold text-[#1d1d1f] mb-3">Terpeny</p>
          <div className="flex flex-wrap gap-2">
            {product.terpenes.map((t, i) => {
              const dotColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-400']
              return (
                <div key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#DEE2E6]">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[i % dotColors.length]}`} />
                  <span className="text-xs font-medium text-[#515154]">{t}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
