import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Plus, Edit2, Trash2, Search, Package, ArrowLeft, X, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { blink } from '../../lib/blink'
import type { Product, Category } from '../../types'
import toast from 'react-hot-toast'

interface ProductForm {
  name: string
  slug: string
  description: string
  price: string
  comparePrice: string
  categoryId: string
  images: string
  sizes: string
  colors: string
  stock: string
  isFeatured: boolean
  isActive: boolean
  tags: string
}

const emptyForm: ProductForm = {
  name: '', slug: '', description: '', price: '', comparePrice: '',
  categoryId: '', images: '', sizes: '', colors: '', stock: '0',
  isFeatured: false, isActive: true, tags: '',
}

export default function AdminProductsPage() {
  const { isAdmin, isLoading } = useApp()
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate({ to: '/' })
  }, [isLoading, isAdmin])

  async function loadProducts() {
    setIsDataLoading(true)
    try {
      const [prods, cats] = await Promise.all([
        blink.db.products.list({ orderBy: { createdAt: 'desc' }, limit: 200 }),
        blink.db.categories.list({ orderBy: { sortOrder: 'asc' } }),
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
      toast.error('Failed to load products')
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => { if (isAdmin) loadProducts() }, [isAdmin])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      categoryId: product.categoryId || '',
      images: product.images.join('\n'),
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      stock: product.stock.toString(),
      isFeatured: !!product.isFeatured && Number(product.isFeatured) > 0,
      isActive: product.isActive === undefined ? true : (!!product.isActive && Number(product.isActive) > 0),
      tags: product.tags.join(', '),
    })
    setShowForm(true)
  }

  const handleNew = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) { toast.error('Name and price are required'); return }
    setIsSaving(true)
    try {
      const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const data = {
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        categoryId: form.categoryId || null,
        images: JSON.stringify(form.images.split('\n').map(s => s.trim()).filter(Boolean)),
        sizes: JSON.stringify(form.sizes.split(',').map(s => s.trim()).filter(Boolean)),
        colors: JSON.stringify(form.colors.split(',').map(s => s.trim()).filter(Boolean)),
        stock: parseInt(form.stock) || 0,
        isFeatured: form.isFeatured ? 1 : 0,
        isActive: form.isActive ? 1 : 0,
        tags: JSON.stringify(form.tags.split(',').map(s => s.trim()).filter(Boolean)),
        updatedAt: new Date().toISOString(),
      }

      if (editingProduct) {
        await blink.db.products.update(editingProduct.id, data)
        toast.success('Product updated!')
      } else {
        await blink.db.products.create({ id: `prod_${Date.now()}`, ...data, createdAt: new Date().toISOString() })
        toast.success('Product created!')
      }
      setShowForm(false)
      await loadProducts()
    } catch (err) {
      toast.error('Failed to save product')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      await blink.db.products.update(productId, { isActive: 0 })
      toast.success('Product deactivated')
      setDeleteConfirm(null)
      await loadProducts()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  if (isLoading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!isAdmin) return null

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Manage Products</h1>
              <p className="text-muted-foreground text-sm">{products.length} products total</p>
            </div>
          </div>
          <button onClick={handleNew} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
            <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl my-4 animate-scale-in">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5">Product Name *</label>
                  <input type="text" value={form.name} onChange={e => {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                    setForm(prev => ({ ...prev, name: e.target.value, slug: prev.slug || slug }))
                  }} placeholder="Rainbow Stripe Onesie" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Slug (URL)</label>
                  <input type="text" value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="rainbow-stripe-onesie" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Category</label>
                  <select value={form.categoryId} onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Price (USD) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} placeholder="29.99" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Compare Price (Original)</label>
                  <input type="number" step="0.01" value={form.comparePrice} onChange={e => setForm(prev => ({ ...prev, comparePrice: e.target.value }))} placeholder="39.99" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Stock Quantity</label>
                  <input type="number" value={form.stock} onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Product description..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5">Image URLs (one per line)</label>
                  <textarea rows={2} value={form.images} onChange={e => setForm(prev => ({ ...prev, images: e.target.value }))} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Sizes (comma separated)</label>
                  <input type="text" value={form.sizes} onChange={e => setForm(prev => ({ ...prev, sizes: e.target.value }))} placeholder="4Y, 5Y, 6Y, 7Y" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Colors (comma separated)</label>
                  <input type="text" value={form.colors} onChange={e => setForm(prev => ({ ...prev, colors: e.target.value }))} placeholder="Pink, Blue, White" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5">Tags (comma separated)</label>
                  <input type="text" value={form.tags} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="bestseller, organic, new" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}>
                      {form.isFeatured ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} className="text-muted-foreground" />}
                    </button>
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}>
                      {form.isActive ? <ToggleRight size={24} className="text-primary" /> : <ToggleLeft size={24} className="text-muted-foreground" />}
                    </button>
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="p-5 border-t border-border flex gap-3">
                <button onClick={handleSave} disabled={isSaving} className="btn-primary flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  <Save size={15} /> {isSaving ? 'Saving...' : 'Save Product'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {isDataLoading ? (
            <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(product => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : <div className="w-full h-full flex items-center justify-center text-sm">👕</div>}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
                        {product.comparePrice && (
                          <p className="text-xs text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${(product.stock || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock || 0} units
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {Number(product.isFeatured) > 0 && <span className="text-xs badge-best px-2 py-0.5 rounded-full text-white w-fit">Featured</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${Number(product.isActive) > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {Number(product.isActive) > 0 ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(product)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                            <Edit2 size={14} />
                          </button>
                          {deleteConfirm === product.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(product.id)} className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white font-medium">Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs rounded-lg border border-border">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(product.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
