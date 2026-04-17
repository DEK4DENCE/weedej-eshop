'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react'
import type { Category, StrainType, ActiveSubstance } from '@/types/product'

const STRAIN_TYPES: { value: StrainType; label: string }[] = [
  { value: 'INDICA', label: 'Indica' },
  { value: 'SATIVA', label: 'Sativa' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'CBD', label: 'CBD' },
]

const SUBSTANCE_TYPES: { value: ActiveSubstance; label: string; color: string }[] = [
  { value: 'THC_X', label: 'THC-X', color: 'bg-blue-50 border-blue-400 text-blue-700' },
  { value: 'THC',   label: 'THC',   color: 'bg-purple-50 border-purple-400 text-purple-700' },
  { value: 'CBD',   label: 'CBD',   color: 'bg-green-50 border-green-500 text-green-700' },
  { value: 'HHC',   label: 'HHC',   color: 'bg-orange-50 border-orange-400 text-orange-700' },
]

export function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [availableTerpenes, setAvailableTerpenes] = useState<string[]>([])
  const [availableEffects, setAvailableEffects] = useState<string[]>([])

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('category')
  )
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  // Default true unless explicitly set to 'false'
  const [inStock, setInStock] = useState(searchParams.get('inStock') !== 'false')
  const [selectedStrains, setSelectedStrains] = useState<StrainType[]>(
    (searchParams.getAll('strainType') as StrainType[]) ?? []
  )
  const [selectedSubstances, setSelectedSubstances] = useState<ActiveSubstance[]>(
    (searchParams.getAll('substance') as ActiveSubstance[]) ?? []
  )
  const [selectedTerpenes, setSelectedTerpenes] = useState<string[]>(
    searchParams.getAll('terpene')
  )
  const [selectedEffects, setSelectedEffects] = useState<string[]>(
    searchParams.getAll('effect')
  )

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error)

    fetch('/api/products/filter-options')
      .then((r) => r.json())
      .then((data) => {
        setAvailableTerpenes(data.terpenes ?? [])
        setAvailableEffects(data.effects ?? [])
      })
      .catch(console.error)
  }, [])

  function applyFilters(overrides: {
    categories?: string[]
    strains?: StrainType[]
    substances?: ActiveSubstance[]
    terpenes?: string[]
    effects?: string[]
    inStock?: boolean
    minPrice?: string
    maxPrice?: string
  } = {}) {
    const cats       = overrides.categories  ?? selectedCategories
    const strains    = overrides.strains     ?? selectedStrains
    const substances = overrides.substances  ?? selectedSubstances
    const terpenes   = overrides.terpenes    ?? selectedTerpenes
    const effects    = overrides.effects     ?? selectedEffects
    const stock      = overrides.inStock     ?? inStock
    const min        = overrides.minPrice    ?? minPrice
    const max        = overrides.maxPrice    ?? maxPrice

    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('strainType')
    params.delete('substance')
    params.delete('terpene')
    params.delete('effect')
    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('inStock')
    params.delete('page')
    cats.forEach((c) => params.append('category', c))
    strains.forEach((s) => params.append('strainType', s))
    substances.forEach((s) => params.append('substance', s))
    terpenes.forEach((t) => params.append('terpene', t))
    effects.forEach((e) => params.append('effect', e))
    if (min) params.set('minPrice', min)
    if (max) params.set('maxPrice', max)
    // Only write inStock=false when explicitly unchecked; default (true) needs no param
    if (!stock) params.set('inStock', 'false')
    router.push(`${pathname}?${params.toString()}`)
  }

  function toggleCategory(slug: string) {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug]
    setSelectedCategories(next)
    applyFilters({ categories: next })
  }

  function toggleStrain(strain: StrainType) {
    const next = selectedStrains.includes(strain)
      ? selectedStrains.filter((s) => s !== strain)
      : [...selectedStrains, strain]
    setSelectedStrains(next)
    applyFilters({ strains: next })
  }

  function toggleSubstance(sub: ActiveSubstance) {
    const next = selectedSubstances.includes(sub)
      ? selectedSubstances.filter((s) => s !== sub)
      : [...selectedSubstances, sub]
    setSelectedSubstances(next)
    applyFilters({ substances: next })
  }

  function toggleTerpene(terpene: string) {
    const next = selectedTerpenes.includes(terpene)
      ? selectedTerpenes.filter((t) => t !== terpene)
      : [...selectedTerpenes, terpene]
    setSelectedTerpenes(next)
    applyFilters({ terpenes: next })
  }

  function toggleEffect(effect: string) {
    const next = selectedEffects.includes(effect)
      ? selectedEffects.filter((e) => e !== effect)
      : [...selectedEffects, effect]
    setSelectedEffects(next)
    applyFilters({ effects: next })
  }

  function handleInStockChange(checked: boolean) {
    setInStock(checked)
    applyFilters({ inStock: checked })
  }

  function resetFilters() {
    setSelectedCategories([])
    setSelectedStrains([])
    setSelectedSubstances([])
    setSelectedTerpenes([])
    setSelectedEffects([])
    setMinPrice('')
    setMaxPrice('')
    setInStock(true) // reset back to default (in stock only)
    const params = new URLSearchParams()
    const search = searchParams.get('search')
    if (search) params.set('search', search)
    // No inStock param = default true
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedStrains.length > 0 ||
    selectedSubstances.length > 0 ||
    selectedTerpenes.length > 0 ||
    selectedEffects.length > 0 ||
    minPrice || maxPrice ||
    !inStock // inStock=false is a non-default active filter

  const activeCount =
    selectedCategories.length +
    selectedStrains.length +
    selectedSubstances.length +
    selectedTerpenes.length +
    selectedEffects.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (!inStock ? 1 : 0)

  return (
    <aside className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-[#1d1d1f] font-semibold md:pointer-events-none"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
        >
          <SlidersHorizontal size={16} className="text-[#2E7D32]" />
          Filtry
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2E7D32] text-white text-[9px] font-bold">
              {activeCount}
            </span>
          )}
          <motion.span
            animate={{ rotate: mobileOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            <ChevronDown size={16} className="text-[#6e6e73]" />
          </motion.span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-[#6e6e73] hover:text-[#2E7D32] transition-colors"
          >
            <RotateCcw size={12} />
            Resetovat
          </button>
        )}
      </div>

      {/* Filter body */}
      <div
        className={[
          'flex flex-col gap-5 overflow-hidden transition-all duration-300 ease-in-out',
          mobileOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[1200px] md:opacity-100',
        ].join(' ')}
      >

        {/* In Stock — first, default checked */}
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => handleInStockChange(e.target.checked)}
            className="w-4 h-4 rounded border border-[#DEE2E6] accent-[#2E7D32] cursor-pointer"
          />
          <span className="text-sm text-[#6e6e73] group-hover:text-[#1d1d1f] transition-colors">
            Pouze skladem
          </span>
        </label>

        {/* Category */}
        {categories.length > 0 && (
          <div>
            <p className="text-sm font-medium text-[#515154] mb-3">Kategorie</p>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => toggleCategory(cat.slug)}
                    className="w-4 h-4 rounded border border-[#DEE2E6] accent-[#2E7D32] cursor-pointer"
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
          <p className="text-sm font-medium text-[#515154] mb-3">Cenové rozmezí</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => applyFilters({ minPrice })}
              placeholder="Min Kč"
              min={0}
              className="w-full bg-[#fafafa] border border-[#DEE2E6] rounded-xl px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/30"
            />
            <span className="text-[#aeaeb2] text-sm flex-shrink-0">—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => applyFilters({ maxPrice })}
              placeholder="Max Kč"
              min={0}
              className="w-full bg-[#fafafa] border border-[#DEE2E6] rounded-xl px-3 py-2 text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/30"
            />
          </div>
        </div>

        {/* Active Substance */}
        <div>
          <p className="text-sm font-medium text-[#515154] mb-3">Účinná látka</p>
          <div className="flex flex-wrap gap-2">
            {SUBSTANCE_TYPES.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => toggleSubstance(value)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                  selectedSubstances.includes(value)
                    ? color
                    : 'bg-[#fafafa] border-[#DEE2E6] text-[#6e6e73] hover:border-[#2E7D32]/50 hover:text-[#1d1d1f]',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Strain Type */}
        <div>
          <p className="text-sm font-medium text-[#515154] mb-3">Typ odrůdy</p>
          <div className="flex flex-wrap gap-2">
            {STRAIN_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleStrain(value)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                  selectedStrains.includes(value)
                    ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32]'
                    : 'bg-[#fafafa] border-[#DEE2E6] text-[#6e6e73] hover:border-[#2E7D32]/50 hover:text-[#1d1d1f]',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Effects */}
        {availableEffects.length > 0 && (
          <div>
            <p className="text-sm font-medium text-[#515154] mb-3">Účinky</p>
            <div className="flex flex-wrap gap-2">
              {availableEffects.map((effect) => (
                <button
                  key={effect}
                  onClick={() => toggleEffect(effect)}
                  className={[
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                    selectedEffects.includes(effect)
                      ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32]'
                      : 'bg-[#fafafa] border-[#DEE2E6] text-[#6e6e73] hover:border-[#2E7D32]/50 hover:text-[#1d1d1f]',
                  ].join(' ')}
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Terpenes */}
        {availableTerpenes.length > 0 && (
          <div>
            <p className="text-sm font-medium text-[#515154] mb-3">Terpény</p>
            <div className="flex flex-wrap gap-2">
              {availableTerpenes.map((terpene) => (
                <button
                  key={terpene}
                  onClick={() => toggleTerpene(terpene)}
                  className={[
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                    selectedTerpenes.includes(terpene)
                      ? 'bg-amber-50 border-amber-400 text-amber-700'
                      : 'bg-[#fafafa] border-[#DEE2E6] text-[#6e6e73] hover:border-amber-300 hover:text-[#1d1d1f]',
                  ].join(' ')}
                >
                  {terpene}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  )
}
