import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import type { UserProfile, CartItem, Product } from '../types'

interface CartItemWithProduct extends CartItem {
  product?: Product
}

interface AppContextType {
  user: Record<string, unknown> | null
  profile: UserProfile | null
  isLoading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  cart: {
    items: CartItemWithProduct[]
    isLoading: boolean
    itemCount: number
    subtotal: number
    addToCart: (productId: string, quantity?: number, size?: string, color?: string) => Promise<void>
    updateQuantity: (itemId: string, quantity: number) => Promise<void>
    removeItem: (itemId: string) => Promise<void>
    clearCart: () => Promise<void>
    refetch: () => Promise<void>
  }
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const userId = auth.user?.id as string | null
  const cart = useCart(userId)

  return (
    <AppContext.Provider value={{
      user: auth.user,
      profile: auth.profile,
      isLoading: auth.isLoading,
      isAdmin: auth.isAdmin,
      isAuthenticated: auth.isAuthenticated,
      cart,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
