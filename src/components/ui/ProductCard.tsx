import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Product } from '../../types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { cart } = useApp()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imgError, setImgError] = useState(false)

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const tags: string[] = Array.isArray(product.tags) ? product.tags : []
  const images: string[] = Array.isArray(product.images) ? product.images : []
  const isBestseller = tags.includes('bestseller')
  const isNew = tags.includes('new')

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAddingToCart(true)
    try {
      const sizes: string[] = Array.isArray(product.sizes) ? product.sizes : []
      await cart.addToCart(product.id, 1, sizes[0], undefined)
      toast.success('Added to cart!', { icon: '🛒' })
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className={`group block bg-card rounded-2xl overflow-hidden border border-border card-hover product-card ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {!imgError && images[0] ? (
          <img
            src={images[0]}
            alt={product.name}
            className="w-full h-full object-cover product-image"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <span className="text-4xl">👕</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge-sale text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {isNew && (
            <span className="badge-new text-xs font-bold px-2 py-0.5 rounded-full text-white">NEW</span>
          )}
          {isBestseller && (
            <span className="badge-best text-xs font-bold px-2 py-0.5 rounded-full text-white">⭐ Best</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setIsWishlisted(!isWishlisted) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <Heart
            size={14}
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
          />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart size={14} />
            {product.stock === 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground mb-1 truncate">
          {Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes.slice(0, 3).join(' · ') : ''}
        </p>
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</span>
          )}
        </div>
        {/* Rating mock */}
        <div className="flex items-center gap-1 mt-1.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={10} className={s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-muted'} />
          ))}
          <span className="text-xs text-muted-foreground">(24)</span>
        </div>
      </div>
    </Link>
  )
}
