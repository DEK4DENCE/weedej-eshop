'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import type { Category, StrainType } from '@/types/product'

const STRAIN_TYPES: { value: StrainType; label: string }[] = [
  { value: 'INDICA', label: 'Indica' },
  { value: 'SATIVA', label: 'Sativa' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'CBD', label: 'CBD' },
]

export function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('category')
  )
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true')
  const [selectedStrains, setSelectedStrains] = useState<StrainType[]>(
    (searchParams.getAll('strainType') as StrainType[]) ?? []
  )

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error)
  }, [])

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    )
  }

  function toggleStrain(strain: StrainType) {
    setSelectedStrains((prev) =>
      prev.includes(strain) ? prev.filter((s) => s !== strain) : [...prev, strain]
    )
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('strainType')
    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('inStock')
    params.delete('page')
    selectedCategories.forEach((c) => params.append('category', c))
    selectedStrains.forEach((s) => params.append('strainType', s))
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (inStock) params.set('inStock', 'true')
    router.push(`${pathname}?${params.toString()}`)
  }

  function resetFilters() {
    setSelectedCategories([])
    setSelectedStrains([])
    setMinPrice('')
    setMaxPrice('')
    setInStock(false)
    const params = new URLSearchParams()
    const search = searchParams.get('search')
    if (search) params.set('search', search)
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedStrains.length > 0 || minPrice || maxPrice || inStock

  return (
    <aside className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1d1d1f] font-semibold">
          <SlidersHorizontal size={16} className="text-[#22A829]" />
          Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-[#6e6e73] hover:text-[#22A829] transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[#515154] mb-3">Category</p>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleCategory(cat.slug)}
                  className="w-4 h-4 rounded border border-[#d2d2d7] accent-[#22A829] cursor-pointer"
                />
                <span className="text-sm text-[#6e6e73] group-hover:text-[#1d1d1f] transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <p className="text-sm font-medium text-[#515154] mb-3">Price Range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            min={0}
            className="w-full bg-[#fafafa] border border-[#d2d2d7] rounded-xl px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#22A829] focus:ring-1 focus:ring-[#22A829]/30"
          />
          <span className="text-[#aeaeb2] text-sm flex-shrink-0">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            min={0}
            className="w-full bg-[#fafafa] border border-[#d2d2d7] rounded-xl px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#22A829] focus:ring-1 focus:ring-[#22A829]/30"
          />
        </div>
      </div>

      {/* In Stock */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="w-4 h-4 rounded border border-[#d2d2d7] accent-[#22A829] cursor-pointer"
        />
        <span className="text-sm text-[#6e6e73] group-hover:text-[#1d1d1f] transition-colors">
          In Stock Only
        </span>
      </label>

      {/* Strain Type */}
      <div>
        <p className="text-sm font-medium text-[#515154] mb-3">Strain Type</p>
        <div className="flex flex-wrap gap-2">
          {STRAIN_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleStrain(value)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                selectedStrains.includes(value)
                  ? 'bg-[#22A829]/10 border-[#22A829] text-[#22A829]'
                  : 'bg-[#fafafa] border-[#d2d2d7] text-[#6e6e73] hover:border-[#22A829]/50 hover:text-[#1d1d1f]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Apply */}
      <button
        onClick={applyFilters}
        className="w-full bg-[#22A829] hover:bg-[#1a9020] text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_4px_16px_rgba(34,168,41,0.3)]"
      >
        Apply Filters
      </button>
    </aside>
  )
}
