'use client';

import React from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGrid } from '../../../components/products/ProductGrid';
import { INITIAL_PRODUCTS } from '../../../hooks/useCart';

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const title = params.slug.replace('-', ' ').toUpperCase();

  return (
    <>
      <Header />
      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Curated Capsule</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1 capitalize">{title}</h1>
        </div>

        <ProductGrid products={INITIAL_PRODUCTS} />
      </main>
      <Footer />
    </>
  );
}
