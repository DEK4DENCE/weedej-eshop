export interface CartItem {
  id: string
  cartId: string
  productId: string
  variantId: string
  quantity: number
  product: { id: string; name: string; slug: string; imageUrls: string[] }
  variant: { id: string; name: string; price: number; stock: number; variantValue?: number | null; variantUnit?: string | null }
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
}
