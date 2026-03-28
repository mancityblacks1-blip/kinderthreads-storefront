import React, { useEffect, useState, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { SlidersHorizontal, X, ChevronDown, Search, Grid3X3, LayoutList } from 'lucide-react'
import { blink } from '../lib/blink'
import type { Product, Category } from '../types'
import { ProductCard } from '../components/ui/ProductCard'

const SIZE_OPTIONS = ['NB', '0-3M', '3M', '6M', '9M', '12M', '18M', '2T', '3T', '4T', '4Y', '5Y', '6Y', '7Y', '8Y', '9Y', '10Y', 'S', 'M', 'L']
const COLOR_OPTIONS = ['White', 'Black', 'Pink', 'Blue', 'Green', 'Yellow', 'Red', 'Purple', 'Orange', 'Gray', 'Navy', 'Brown']

function ProductSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      <div className="aspect-[4/5] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton rounded-full w-3/4" />
        <div className="h-4 skeleton rounded-full w-full" />
        <div className="h-5 skeleton rounded-full w-1/3" />
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const search = useSearch({ from: '/products' }) as Record<string, string | boolean | undefined>
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [selectedCategory, setSelectedCategory] = useState<string>(search.category as string || '')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [sortBy, setSortBy] = useState<string>('newest')
  const [searchQuery, setSearchQuery] = useState<string>(search.q as string || '')

  useEffect(() => {
    setSelectedCategory(search.category as string || '')
    setSearchQuery(search.q as string || '')
  }, [search.category, search.q])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [cats, prods] = await Promise.all([
          blink.db.categories.list({ orderBy: { sortOrder: 'asc' } }),
          blink.db.products.list({ where: { isActive: '1' }, limit: 100 }),
        ])

        setCategories(cats as Category[])
        setProducts(prods.map(p => {
          const prod = p as Record<string, unknown>
          return {
            ...prod,
            images: JSON.parse((prod.images as string) || '[]'),
            sizes: JSON.parse((prod.sizes as string) || '[]'),
            colors: JSON.parse((prod.colors as string) || '[]'),
            tags: JSON.parse((prod.tags as string) || '[]'),
            isFeatured: Number(prod.isFeatured || prod.is_featured) > 0,
            isActive: Number(prod.isActive || prod.is_active) > 0,
          } as Product
        }))
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }

    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory)
      if (cat) filtered = filtered.filter(p => p.categoryId === cat.id)
    }

    if (search.featured) {
      filtered = filtered.filter(p => Number(p.isFeatured) > 0 || p.isFeatured === true)
    }

    if (search.tag) {
      filtered = filtered.filter(p => (p.tags || []).includes(search.tag as string))
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => (p.sizes || []).some(s => selectedSizes.includes(s)))
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => (p.colors || []).some(c => selectedColors.includes(c)))
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    switch (sortBy) {
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break
      case 'popularity': filtered.sort((a, b) => (Number(b.isFeatured) - Number(a.isFeatured))); break
      default: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [products, categories, selectedCategory, selectedSizes, selectedColors, priceRange, sortBy, searchQuery, search.featured, search.tag])

  const toggleSize = (s: string) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleColor = (c: string) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const clearFilters = () => {
    setSelectedCategory(''); setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, 200])
    navigate({ to: '/products' })
  }

  const activeFilterCount = (selectedCategory ? 1 : 0) + selectedSizes.length + selectedColors.length + (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0)

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Products' : 'All Products'}
          </h1>
          <p className="text-muted-foreground">{filteredProducts.length} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && <span className="bg-white/20 text-xs px-1.5 rounded-full">{activeFilterCount}</span>}
            </button>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Newest First</option>
              <option value="popularity">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <div className="hidden sm:flex gap-1 border border-border rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-muted' : ''}`}>
                <Grid3X3 size={14} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-muted' : ''}`}>
                <LayoutList size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-64 flex-shrink-0 animate-slide-in-right">
              <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <X size={12} /> Clear all
                    </button>
                  )}
                </div>

                {/* Category */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Category</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${selectedCategory === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSize(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${selectedSizes.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={0}
                      max={200}
                      step={5}
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c}
                        onClick={() => toggleColor(c)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${selectedColors.includes(c) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedCategory === cat.slug ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display text-2xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-primary px-6 py-3 rounded-xl font-medium">Clear Filters</button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
              }>
                {filteredProducts.map((p, i) => (
                  <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 7) * 0.05}s` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
