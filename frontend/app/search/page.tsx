'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { ProductGrid } from '../../components/products/ProductGrid';
import { INITIAL_PRODUCTS } from '../../hooks/useCart';
import { Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = query.trim()
    ? INITIAL_PRODUCTS.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.category.name.toLowerCase().includes(query.toLowerCase())
      )
    : INITIAL_PRODUCTS;

  return (
    <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto mb-10 text-center">
        <h1 className="font-serif text-3xl font-normal text-stone-900 mb-4">Search Results</h1>
        
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dresses, rompers, sets..."
            className="w-full bg-stone-50 border border-stone-200 text-sm px-4 py-3 pl-10 rounded-xl focus:outline-none focus:border-brand-600 shadow-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
        </div>

        {query && (
          <p className="text-xs text-stone-500 mt-3">
            Showing {filtered.length} results for "{query}"
          </p>
        )}
      </div>

      <ProductGrid products={filtered} />
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-20 text-center text-xs text-stone-500">Loading search...</div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </>
  );
}
