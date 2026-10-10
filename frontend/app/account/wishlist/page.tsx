'use client';

import React from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGrid } from '../../../components/products/ProductGrid';
import { INITIAL_PRODUCTS } from '../../../hooks/useCart';

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl text-stone-900 font-normal mb-8">My Saved Wishlist</h1>
        <ProductGrid products={INITIAL_PRODUCTS.slice(0, 2)} />
      </main>
      <Footer />
    </>
  );
}
