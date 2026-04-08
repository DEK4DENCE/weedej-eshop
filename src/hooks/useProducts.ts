'use client'

import { useState, useEffect } from 'react'
import type { Product, ProductFilters, ProductsResponse } from '@/types/product'

export function useProducts(params?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const searchParams = new URLSearchParams()
        if (params?.category) searchParams.set('category', params.category)
        if (params?.search) searchParams.set('search', params.search)
        if (params?.featured) searchParams.set('featured', 'true')
        if (params?.page) searchParams.set('page', String(params.page))
        if (params?.limit) searchParams.set('limit', String(params.limit))

        const url = `/api/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const res = await fetch(url, { signal: controller.signal })

        if (!res.ok) throw new Error('Failed to fetch products')

        const data: ProductsResponse = await res.json()
        setProducts(data.products)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()

    return () => controller.abort()
  }, [params?.category, params?.search, params?.featured, params?.page, params?.limit])

  return { products, total, totalPages, isLoading, error }
}
