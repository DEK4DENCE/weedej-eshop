export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  imageUrls: string[]
  categoryId: string
  category: Category
  isActive: boolean
  isFeatured: boolean
  basePrice: number
  thcContent?: number
  cbdContent?: number
  strainType?: 'INDICA' | 'SATIVA' | 'HYBRID' | 'CBD'
  sativaPercent?: number
  indicaPercent?: number
  effects: string[]
  flavours: string[]
  terpenes: string[]
  imageAdjustments?: string | null
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku?: string
  price: number
  weightGrams?: number
  stock: number
  isDefault: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  icon?: string
  isActive: boolean
  sortOrder: number
}

export type StrainType = 'INDICA' | 'SATIVA' | 'HYBRID' | 'CBD'

export interface ProductFilters {
  category?: string
  search?: string
  featured?: boolean
  page?: number
  limit?: number
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  strainType?: StrainType
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}
