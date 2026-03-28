import React from 'react'
import { Link } from '@tanstack/react-router'
import { Mail, Phone, MapPin, Heart, Globe, AtSign, Share2 } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-display font-bold text-xl">
                Kinder<span className="text-primary">Threads</span>
              </span>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Quality children's clothing made with love. Soft, durable, and designed for little adventures.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center">
                <Globe size={14} />
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center">
                <AtSign size={14} />
              </a>
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center">
                <Share2 size={14} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/products" search={{ category: 'newborn' }} className="hover:opacity-100 hover:text-primary transition-colors">Newborn (0-3M)</Link></li>
              <li><Link to="/products" search={{ category: 'baby' }} className="hover:opacity-100 hover:text-primary transition-colors">Baby (3-12M)</Link></li>
              <li><Link to="/products" search={{ category: 'toddler' }} className="hover:opacity-100 hover:text-primary transition-colors">Toddler (1-3Y)</Link></li>
              <li><Link to="/products" search={{ category: 'kids' }} className="hover:opacity-100 hover:text-primary transition-colors">Kids (4-8Y)</Link></li>
              <li><Link to="/products" search={{ category: 'tween' }} className="hover:opacity-100 hover:text-primary transition-colors">Tween (8-12Y)</Link></li>
              <li><Link to="/products" search={{ category: 'accessories' }} className="hover:opacity-100 hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/account" className="hover:opacity-100 hover:text-primary transition-colors">My Account</Link></li>
              <li><Link to="/orders" className="hover:opacity-100 hover:text-primary transition-colors">Track My Order</Link></li>
              <li><a href="#" className="hover:opacity-100 hover:text-primary transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:opacity-100 hover:text-primary transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:opacity-100 hover:text-primary transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:opacity-100 hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm opacity-70">
              <li className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0" />
                <span>support@kinderthreads.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0" />
                <span>+20 100 000 0000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                <span>Cairo, Egypt</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs opacity-50 mb-2">We accept:</p>
              <div className="flex items-center gap-2">
                <div className="bg-white/10 rounded px-2 py-1 text-xs font-mono">VISA</div>
                <div className="bg-white/10 rounded px-2 py-1 text-xs font-mono">MC</div>
                <div className="bg-red-500/20 rounded px-2 py-1 text-xs text-red-300 font-mono">VF Cash</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-50">
            © 2024 KinderThreads. All rights reserved.
          </p>
          <p className="text-xs opacity-50 flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400" /> for little ones everywhere
          </p>
          <div className="flex items-center gap-4 text-xs opacity-50">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
