'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface ProductSearchProps {
  placeholder?: string
  className?: string
}

export function ProductSearch({ placeholder = 'Hledat produkty…', className = '' }: ProductSearchProps) {
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
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-[#fafafa] border border-[#DEE2E6] rounded-xl pl-9 pr-9 py-2.5 text-sm text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 transition-all duration-200"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#6e6e73] transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
