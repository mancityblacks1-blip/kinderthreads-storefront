import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ShoppingCart, Search, User, Menu, X, Heart, Package } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { blink } from '../../lib/blink'

export function Navbar() {
  const { isAuthenticated, isAdmin, cart, profile } = useApp()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate({ to: '/products', search: { q: searchQuery.trim() } })
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleAuthAction = () => {
    if (isAuthenticated) {
      navigate({ to: '/account' })
    } else {
      blink.auth.login(window.location.href)
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-background'
    }`}>
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground text-xs text-center py-2 px-4">
        🚀 Free shipping on orders over $75 | Use code <strong>WELCOME20</strong> for 20% off your first order!
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground hidden sm:block">
              Kinder<span className="text-primary">Threads</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              All Products
            </Link>
            <Link to="/products" search={{ category: 'newborn' }} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Newborn
            </Link>
            <Link to="/products" search={{ category: 'baby' }} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Baby
            </Link>
            <Link to="/products" search={{ category: 'toddler' }} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Toddler
            </Link>
            <Link to="/products" search={{ category: 'kids' }} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Kids
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-foreground" />
            </button>

            <button
              onClick={handleAuthAction}
              className="p-2 rounded-full hover:bg-muted transition-colors hidden sm:flex"
              aria-label="Account"
            >
              <User size={20} className="text-foreground" />
            </button>

            <Link
              to="/cart"
              className="p-2 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingCart size={20} className="text-foreground" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link to="/products" className="block text-sm font-medium py-2 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              All Products
            </Link>
            <Link to="/products" search={{ category: 'newborn' }} className="block text-sm font-medium py-2 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Newborn
            </Link>
            <Link to="/products" search={{ category: 'baby' }} className="block text-sm font-medium py-2 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Baby
            </Link>
            <Link to="/products" search={{ category: 'toddler' }} className="block text-sm font-medium py-2 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Toddler
            </Link>
            <Link to="/products" search={{ category: 'kids' }} className="block text-sm font-medium py-2 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
              Kids
            </Link>
            <div className="border-t border-border pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="flex items-center gap-2 text-sm font-medium py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                    <User size={16} /> My Account
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 text-sm font-medium py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                    <Package size={16} /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 text-sm font-medium py-2 text-primary" onClick={() => setIsMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { blink.auth.signOut(); setIsMenuOpen(false) }}
                    className="text-left text-sm font-medium py-2 text-destructive"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { blink.auth.login(window.location.href); setIsMenuOpen(false) }}
                  className="btn-primary text-sm font-medium py-2 px-4 rounded-lg text-center"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsSearchOpen(false)}>
          <div className="max-w-2xl mx-auto mt-32 px-4" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="relative animate-scale-in">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for kids clothing..."
                autoFocus
                className="w-full pl-12 pr-12 py-4 rounded-2xl border border-border bg-background text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">Press Enter to search or Escape to close</p>
          </div>
        </div>
      )}
    </nav>
  )
}
