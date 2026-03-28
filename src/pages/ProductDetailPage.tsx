import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Share2, Minus, Plus } from 'lucide-react'
import { blink } from '../lib/blink'
import type { Product } from '../types'
import { useApp } from '../context/AppContext'
import { ProductCard } from '../components/ui/ProductCard'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams({ from: '/products/$slug' })
  const { cart } = useApp()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true)
      try {
        const prods = await blink.db.products.list({ where: { slug, isActive: '1' }, limit: 1 })
        if (prods.length === 0) { navigate({ to: '/products' }); return }
        const p = prods[0] as Record<string, unknown>
        const parsed = {
          ...p,
          images: JSON.parse((p.images as string) || '[]'),
          sizes: JSON.parse((p.sizes as string) || '[]'),
          colors: JSON.parse((p.colors as string) || '[]'),
          tags: JSON.parse((p.tags as string) || '[]'),
        } as Product
        setProduct(parsed)
        if (parsed.sizes.length > 0) setSelectedSize(parsed.sizes[0])
        if (parsed.colors.length > 0) setSelectedColor(parsed.colors[0])

        // Load related
        if (parsed.categoryId) {
          const rel = await blink.db.products.list({ where: { categoryId: parsed.categoryId, isActive: '1' }, limit: 5 })
          const relFiltered = rel
            .filter(r => (r as Record<string, unknown>).id !== parsed.id)
            .slice(0, 4)
            .map(r => {
              const rp = r as Record<string, unknown>
              return {
                ...rp,
                images: JSON.parse((rp.images as string) || '[]'),
                sizes: JSON.parse((rp.sizes as string) || '[]'),
                colors: JSON.parse((rp.colors as string) || '[]'),
                tags: JSON.parse((rp.tags as string) || '[]'),
              } as Product
            })
          setRelated(relFiltered)
        }
      } catch (err) {
        console.error('Failed to load product:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [slug])

  const handleAddToCart = async () => {
    if (!product) return
    if (product.sizes.length > 0 && !selectedSize) { toast.error('Please select a size'); return }
    setIsAddingToCart(true)
    try {
      await cart.addToCart(product.id, quantity, selectedSize || undefined, selectedColor || undefined)
      toast.success('Added to cart! 🛒')
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate({ to: '/cart' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-12">
          <div className="aspect-square skeleton rounded-3xl" />
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className={`skeleton h-${i === 1 ? 8 : i === 2 ? 12 : 6} rounded-xl`} />)}
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const images: string[] = product.images.length > 0 ? product.images : ['']

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4 animate-fade-in">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted group">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <span className="text-8xl">👕</span>
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4 badge-sale px-3 py-1 rounded-full text-sm font-bold">-{discount}%</div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              {(product.tags || []).includes('bestseller') && (
                <span className="badge-best text-xs font-bold px-3 py-1 rounded-full text-white">⭐ Bestseller</span>
              )}
              {(product.tags || []).includes('new') && (
                <span className="badge-new text-xs font-bold px-3 py-1 rounded-full text-white">NEW</span>
              )}
            </div>

            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} />)}
              </div>
              <span className="text-sm text-muted-foreground">4.8 (128 reviews)</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</span>
              )}
              {discount > 0 && (
                <span className="badge-sale text-sm font-bold px-3 py-1 rounded-full">Save {discount}%</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mb-5">
                <p className="font-semibold text-sm mb-3">Color: <span className="text-primary font-bold">{selectedColor}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${selectedColor === color ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm">Size: <span className="text-primary font-bold">{selectedSize}</span></p>
                  <button className="text-xs text-muted-foreground underline hover:text-primary">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="font-semibold text-sm mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="p-3 hover:bg-muted transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(prev => Math.min(product.stock || 99, prev + 1))} className="p-3 hover:bg-muted transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="flex-1 btn-primary py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {product.stock === 0 ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-4 rounded-xl border-2 transition-colors ${isWishlisted ? 'border-red-400 text-red-500' : 'border-border hover:border-red-400'}`}
              >
                <Heart size={18} className={isWishlisted ? 'fill-red-500' : ''} />
              </button>
              <button className="p-4 rounded-xl border-2 border-border hover:border-primary transition-colors">
                <Share2 size={18} />
              </button>
            </div>

            {product.stock > 0 && (
              <button
                onClick={handleBuyNow}
                className="w-full py-4 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors mb-6"
              >
                Buy Now
              </button>
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-2xl">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Truck size={18} className="text-primary" />
                <p className="text-xs font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">Orders over $75</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <RotateCcw size={18} className="text-primary" />
                <p className="text-xs font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">Within 30 days</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Shield size={18} className="text-primary" />
                <p className="text-xs font-medium">Secure</p>
                <p className="text-xs text-muted-foreground">100% safe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
