'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { INITIAL_PRODUCTS } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TAGS = [
  'Cashmere Romper',
  'Wooden Gym',
  'French Linen',
  'Girls Dresses',
  'Boys Sets',
  'Organic Cotton',
  'Stroller',
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredProducts = query.trim()
    ? INITIAL_PRODUCTS.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.category.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-purple-950/60 backdrop-blur-md"
          />

          {/* Search Box Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative max-w-4xl mx-auto mt-8 md:mt-16 px-4 z-10"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-pastel-lg overflow-hidden border border-purple-100">
              
              {/* Form Input Header */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-purple-100 p-4 md:p-6 bg-purple-50/40">
                <Search className="w-6 h-6 text-purple-600 mr-4" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for dresses, rompers, sets..."
                  className="w-full text-base md:text-xl font-heading font-medium text-purple-950 placeholder-purple-300 bg-transparent focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 text-purple-400 hover:text-purple-700 mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-purple-400 hover:text-purple-900 rounded-2xl hover:bg-purple-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </form>

              {/* Suggestions / Results Area */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {query.trim() === '' ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-bold tracking-widest uppercase text-purple-900 mb-3">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Trending Searches 🌸</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_TAGS.map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleTagClick(tag)}
                            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 text-purple-900 text-xs font-semibold rounded-2xl transition-all shadow-pastel-sm flex items-center space-x-2"
                          >
                            <Tag className="w-3.5 h-3.5 text-purple-400" />
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-100">
                      <h3 className="text-xs font-bold tracking-widest uppercase text-purple-400 mb-4">
                        Curated Atelier Recommendations
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {INITIAL_PRODUCTS.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/products/${prod.slug}`}
                            onClick={onClose}
                            className="group block p-2.5 rounded-2xl hover:bg-purple-50/50 transition-colors border border-transparent hover:border-purple-100"
                          >
                            <div className="aspect-square bg-purple-50 rounded-xl overflow-hidden mb-2 relative">
                              <img
                                src={prod.images[0]?.url || '/images/products/organic-onesie.jpg'}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <h4 className="text-xs font-semibold text-purple-950 truncate group-hover:text-purple-600">
                              {prod.name}
                            </h4>
                            <p className="text-xs text-purple-700 font-bold mt-0.5">
                              {formatCurrency(prod.price)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-purple-100 text-xs">
                      <span className="text-purple-700 font-medium">
                        Found <strong className="text-purple-950">{filteredProducts.length}</strong> results for "{query}"
                      </span>
                      {filteredProducts.length > 0 && (
                        <button
                          onClick={handleSearchSubmit}
                          className="text-purple-600 font-bold hover:underline flex items-center space-x-1"
                        >
                          <span>View All Results</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-12 text-purple-500">
                        <p className="text-sm font-medium">No luxury pieces match "{query}"</p>
                        <p className="text-xs mt-1 text-purple-400">Try searching for cashmere, swaddle, dress, or stroller</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center space-x-4 p-3 rounded-2xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all group shadow-pastel-sm"
                          >
                            <div className="w-16 h-16 bg-purple-50 rounded-xl overflow-hidden flex-shrink-0">
                              <img
                                src={product.images[0]?.url || '/images/products/organic-onesie.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase tracking-wider text-purple-600 font-bold bg-purple-100 px-2 py-0.5 rounded-full">
                                {product.category.name}
                              </span>
                              <h4 className="text-xs font-semibold text-purple-950 truncate group-hover:text-purple-600 mt-1">
                                {product.name}
                              </h4>
                              <p className="text-xs text-purple-900 font-bold mt-0.5">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
