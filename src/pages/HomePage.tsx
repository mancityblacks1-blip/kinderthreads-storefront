import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Star, Shield, Truck, RotateCcw, Leaf } from 'lucide-react'
import { blink } from '../lib/blink'
import type { Product, Category } from '../types'
import { ProductCard } from '../components/ui/ProductCard'

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="hero-gradient min-h-screen pt-20 flex items-center relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-primary border border-primary/20 mb-6">
            🌟 New Spring Collection Is Here
          </div>
          <h1 className="font-display text-5xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Dress Them<br />
            <span className="text-primary">in Magic</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            Discover adorable, high-quality kids' clothing that combines comfort, style, and durability. From newborns to tweens — we've got every little adventure covered.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate({ to: '/products' })}
              className="btn-primary px-8 py-4 rounded-xl font-semibold text-base flex items-center gap-2"
            >
              Shop Now <ArrowRight size={18} />
            </button>
            <Link
              to="/products"
              search={{ tag: 'bestseller' }}
              className="px-8 py-4 rounded-xl font-semibold text-base border-2 border-primary text-primary hover:bg-primary/5 transition-colors"
            >
              View Bestsellers
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-amber-400 text-amber-400" />)}
              </div>
              <span>4.9/5 from 2,000+ parents</span>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-in stagger-2">
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto bg-white/50 rounded-3xl p-8 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800"
                alt="Happy kids in colorful clothes"
                className="w-full h-full object-cover rounded-2xl"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            {/* Floating cards */}
            <div className="absolute -left-8 top-1/4 bg-white rounded-2xl p-3 shadow-lg animate-fade-in stagger-3">
              <p className="text-xs text-muted-foreground">New Arrivals</p>
              <p className="font-bold text-primary">Spring 2024 🌸</p>
            </div>
            <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl p-3 shadow-lg animate-fade-in stagger-4">
              <p className="text-xs text-muted-foreground">Happy Parents</p>
              <p className="font-bold">2,000+ ⭐</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustBadges() {
  const badges = [
    { icon: <Truck size={20} />, title: 'Free Shipping', subtitle: 'On orders over $75' },
    { icon: <RotateCcw size={20} />, title: 'Easy Returns', subtitle: '30-day hassle-free returns' },
    { icon: <Shield size={20} />, title: 'Safe & Secure', subtitle: '100% secure checkout' },
    { icon: <Leaf size={20} />, title: 'Eco-Friendly', subtitle: 'Organic cotton options' },
  ]
  return (
    <section className="border-y border-border bg-card py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b, i) => (
            <div key={i} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {b.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategorySection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold mb-3">Shop by Age</h2>
          <p className="text-muted-foreground">Find the perfect fit for every stage</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat, i) => (
            <Link
              key={cat.id}
              to="/products"
              search={{ category: cat.slug }}
              className="group text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3 card-hover">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-3xl">
                    {['👶','🍼','🧸','🎒','👟','🎀'][i]}
                  </div>
                )}
              </div>
              <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl font-bold mb-2">Featured Picks</h2>
            <p className="text-muted-foreground">Our parents' most-loved styles</p>
          </div>
          <Link to="/products" search={{ featured: true }} className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p, i) => (
            <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PromoSection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500 p-8 min-h-[240px] flex flex-col justify-end card-hover cursor-pointer">
            <div className="absolute inset-0 opacity-20">
              <img src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 text-white">
              <p className="text-sm font-medium opacity-80 mb-1">Limited Time Offer</p>
              <h3 className="font-display text-3xl font-bold mb-2">Baby Sale 🍼</h3>
              <p className="text-sm opacity-80 mb-4">Up to 40% off on all baby essentials</p>
              <Link to="/products" search={{ category: 'baby' }} className="inline-flex items-center gap-1 bg-white text-orange-500 font-semibold px-5 py-2 rounded-full text-sm hover:bg-orange-50 transition-colors">
                Shop Baby <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 p-8 min-h-[240px] flex flex-col justify-end card-hover cursor-pointer">
            <div className="absolute inset-0 opacity-20">
              <img src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 text-white">
              <p className="text-sm font-medium opacity-80 mb-1">New Collection</p>
              <h3 className="font-display text-3xl font-bold mb-2">Spring Styles ✨</h3>
              <p className="text-sm opacity-80 mb-4">Fresh looks for the new season</p>
              <Link to="/products" search={{ tag: 'new' }} className="inline-flex items-center gap-1 bg-white text-violet-600 font-semibold px-5 py-2 rounded-full text-sm hover:bg-violet-50 transition-colors">
                Explore Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    { name: 'Sarah M.', avatar: '👩', text: 'My daughter absolutely loves her new tutu dress! The quality is amazing and it washed perfectly. Will definitely order again!', rating: 5 },
    { name: 'James K.', avatar: '👨', text: 'The dino set is SO cute! My son wears it every chance he gets. Fast shipping and great packaging too.', rating: 5 },
    { name: 'Amira H.', avatar: '👩‍🦱', text: 'Best kids\' clothing store online! The organic onesies are the softest things I\'ve ever touched. My baby loves them.', rating: 5 },
    { name: 'Carlos R.', avatar: '👨‍🦲', text: 'Ordered the newborn gift set for my sister\'s baby shower. She was absolutely thrilled! High quality at a fair price.', rating: 5 },
  ]

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold mb-3">Happy Parents</h2>
          <p className="text-muted-foreground">Join 2,000+ satisfied families</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-background rounded-2xl p-5 border border-border animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setSubmitted(true) }
  }

  return (
    <section className="py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-10 border border-border">
          <p className="text-3xl mb-4">👶</p>
          <h2 className="font-display text-3xl font-bold mb-3">Join the KinderThreads Family</h2>
          <p className="text-muted-foreground mb-6">
            Get exclusive deals, new arrival alerts, and parenting tips. Plus 20% off your first order!
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button type="submit" className="btn-primary px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap">
                Subscribe
              </button>
            </form>
          ) : (
            <p className="text-primary font-semibold">🎉 Welcome to the family! Check your email for your discount code.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          blink.db.categories.list({ orderBy: { sortOrder: 'asc' } }),
          blink.db.products.list({ where: { isFeatured: '1', isActive: '1' }, limit: 8 }),
        ])

        setCategories(cats.map(c => {
          const cat = c as Record<string, unknown>
          return { ...cat, imageUrl: cat.imageUrl || cat.image_url } as Category
        }))

        setProducts(prods.map(p => {
          const prod = p as Record<string, unknown>
          return {
            ...prod,
            images: JSON.parse((prod.images as string) || '[]'),
            sizes: JSON.parse((prod.sizes as string) || '[]'),
            colors: JSON.parse((prod.colors as string) || '[]'),
            tags: JSON.parse((prod.tags as string) || '[]'),
            isFeatured: Number(prod.isFeatured) > 0,
            isActive: Number(prod.isActive) > 0,
          } as Product
        }))
      } catch (err) {
        console.error('Failed to load homepage data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div>
      <HeroSection />
      <TrustBadges />
      {!isLoading && <CategorySection categories={categories} />}
      {!isLoading && products.length > 0 && <FeaturedProducts products={products} />}
      <PromoSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  )
}
