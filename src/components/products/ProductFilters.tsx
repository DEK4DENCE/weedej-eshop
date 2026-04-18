'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal, RotateCcw, ChevronDown, Search, X } from 'lucide-react'
import type { Category, StrainType, ActiveSubstance } from '@/types/product'

const STRAIN_TYPES: { value: StrainType; label: string }[] = [
  { value: 'INDICA', label: 'Indica' },
  { value: 'SATIVA', label: 'Sativa' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'CBD', label: 'CBD' },
]

const SUBSTANCE_TYPES: { value: ActiveSubstance; label: string }[] = [
  { value: 'THC_X', label: 'THC-X' },
  { value: 'THC',   label: 'THC'   },
  { value: 'CBD',   label: 'CBD'   },
  { value: 'HHC',   label: 'HHC'  },
]

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap',
        active
          ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32]'
          : 'bg-[#fafafa] border-[#DEE2E6] text-[#6e6e73] hover:border-[#2E7D32]/50 hover:text-[#1d1d1f]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function SidebarSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(searchParams.get('search') ?? '')
  }, [searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setValue(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.trim()) {
        params.set('search', next.trim())
      } else {
        params.delete('search')
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)
  }

  function handleClear() {
    setValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Hledat produkty…"
        className="w-full bg-[#fafafa] border border-[#DEE2E6] rounded-xl pl-8 pr-8 py-2 text-xs text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 transition-all duration-200"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#6e6e73] transition-colors"
          aria-label="Vymazat hledání"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

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

  function handleInStockToggle() {
    const next = !inStock
    setInStock(next)
    applyFilters({ inStock: next })
  }

  function resetFilters() {
    setSelectedCategories([])
    setSelectedStrains([])
    setSelectedSubstances([])
    setSelectedTerpenes([])
    setSelectedEffects([])
    setMinPrice('')
    setMaxPrice('')
    setInStock(true)
    const params = new URLSearchParams()
    const search = searchParams.get('search')
    if (search) params.set('search', search)
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedStrains.length > 0 ||
    selectedSubstances.length > 0 ||
    selectedTerpenes.length > 0 ||
    selectedEffects.length > 0 ||
    minPrice || maxPrice ||
    !inStock

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
    <aside className="flex flex-col gap-3 w-full">
      {/* Search */}
      <SidebarSearch />

      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          className="flex items-center gap-2 text-[#1d1d1f] font-semibold md:pointer-events-none"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
        >
          <SlidersHorizontal size={15} className="text-[#2E7D32]" />
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
            <ChevronDown size={15} className="text-[#6e6e73]" />
          </motion.span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-[#6e6e73] hover:text-[#2E7D32] transition-colors"
          >
            <RotateCcw size={11} />
            Resetovat
          </button>
        )}
      </div>

      {/* Filter body */}
      <div
        className={[
          'flex flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out',
          mobileOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0 md:max-h-[1200px] md:opacity-100',
        ].join(' ')}
      >
        {/* Category */}
        {categories.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#515154] mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <FilterPill
                  key={cat.id}
                  active={selectedCategories.includes(cat.slug)}
                  onClick={() => toggleCategory(cat.slug)}
                >
                  {cat.name}
                </FilterPill>
              ))}
            </div>
          </div>
        )}

        {/* In Stock */}
        <div>
          <p className="text-xs font-medium text-[#515154] mb-2">Dostupnost</p>
          <FilterPill active={inStock} onClick={handleInStockToggle}>
            Pouze skladem
          </FilterPill>
        </div>

        {/* Active Substance */}
        <div>
          <p className="text-xs font-medium text-[#515154] mb-2">Účinná látka</p>
          <div className="flex flex-wrap gap-1.5">
            {SUBSTANCE_TYPES.map(({ value, label }) => (
              <FilterPill
                key={value}
                active={selectedSubstances.includes(value)}
                onClick={() => toggleSubstance(value)}
              >
                {label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Strain Type */}
        <div>
          <p className="text-xs font-medium text-[#515154] mb-2">Typ odrůdy</p>
          <div className="flex flex-wrap gap-1.5">
            {STRAIN_TYPES.map(({ value, label }) => (
              <FilterPill
                key={value}
                active={selectedStrains.includes(value)}
                onClick={() => toggleStrain(value)}
              >
                {label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Effects */}
        {availableEffects.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#515154] mb-2">Účinky</p>
            <div className="flex flex-wrap gap-1.5">
              {availableEffects.map((effect) => (
                <FilterPill
                  key={effect}
                  active={selectedEffects.includes(effect)}
                  onClick={() => toggleEffect(effect)}
                >
                  {effect}
                </FilterPill>
              ))}
            </div>
          </div>
        )}

        {/* Terpenes */}
        {availableTerpenes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#515154] mb-2">Terpény</p>
            <div className="flex flex-wrap gap-1.5">
              {availableTerpenes.map((terpene) => (
                <FilterPill
                  key={terpene}
                  active={selectedTerpenes.includes(terpene)}
                  onClick={() => toggleTerpene(terpene)}
                >
                  {terpene}
                </FilterPill>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <p className="text-xs font-medium text-[#515154] mb-2">Cenové rozmezí</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => applyFilters({ minPrice })}
              placeholder="Min Kč"
              min={0}
              className="w-full bg-[#fafafa] border border-[#DEE2E6] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/30"
            />
            <span className="text-[#aeaeb2] text-xs flex-shrink-0">—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => applyFilters({ maxPrice })}
              placeholder="Max Kč"
              min={0}
              className="w-full bg-[#fafafa] border border-[#DEE2E6] rounded-xl px-3 py-1.5 text-xs text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/30"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
