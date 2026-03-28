export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  sortOrder: number
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  categoryId?: string
  images: string[]
  sizes: string[]
  colors: string[]
  stock: number
  isFeatured: boolean | string
  isActive: boolean | string
  tags: string[]
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  size?: string
  color?: string
  createdAt: string
  product?: Product
}

export interface ShippingAddress {
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  country: string
  zipCode?: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

export interface Order {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'stripe' | 'vodafone_cash'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  shippingAddress: ShippingAddress
  items: OrderItem[]
  notes?: string
  vodafonePhone?: string
  stripeSessionId?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  userId: string
  displayName?: string
  phone?: string
  address: ShippingAddress
  role: 'customer' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface PromoCode {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrder: number
  maxUses: number
  usedCount: number
  isActive: boolean | string
  expiresAt?: string
  createdAt: string
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: string
  product?: Product
}

export type FilterState = {
  categories: string[]
  sizes: string[]
  colors: string[]
  minPrice: number
  maxPrice: number
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popularity'
  search: string
}
