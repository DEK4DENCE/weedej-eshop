import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GuestCartItem {
  id: string
  productId: string
  variantId: string
  productName: string
  variantName: string
  price: number
  imageUrl: string
  quantity: number
}

interface CartState {
  items: GuestCartItem[]
  serverItems: any[]          // shared DB cart items across all useCart() instances
  sidebarOpen: boolean
  addItem: (item: Omit<GuestCartItem, 'quantity'> & { quantity?: number }) => void
  updateQty: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
  setServerItems: (items: any[]) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      serverItems: [],
      sidebarOpen: false,

      setServerItems: (items: any[]) => set({ serverItems: items }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),
      openSidebar: () => set({ sidebarOpen: true }),

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === newItem.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId
                  ? { ...i, quantity: i.quantity + (newItem.quantity ?? 1) }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { ...newItem, quantity: newItem.quantity ?? 1 },
            ],
          }
        })
      },

      updateQty: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        }))
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      totalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
    }),
    {
      name: 'weedej_cart',
    },
  ),
)
