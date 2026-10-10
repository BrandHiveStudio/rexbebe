'use client';

import React from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGrid } from '../../../components/products/ProductGrid';
import { CategoryHeaderBanner } from '../../../components/layout/CategoryHeaderBanner';
import { INITIAL_PRODUCTS } from '../../../hooks/useCart';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cleanSlug = params.slug.replace(/-/g, ' ');
  const title = cleanSlug.toUpperCase();

  const filtered = INITIAL_PRODUCTS.filter(
    (p) =>
      p.category.slug.toLowerCase().includes(params.slug.toLowerCase()) ||
      p.category.name.toLowerCase().includes(cleanSlug.toLowerCase()) ||
      p.name.toLowerCase().includes(cleanSlug.toLowerCase())
  );

  const displayProducts = filtered.length > 0 ? filtered : INITIAL_PRODUCTS;

  return (
    <>
      <Header />
      <CategoryHeaderBanner
        badge="DEDICATED CATEGORY SELECTION 🌸"
        title={title}
        highlightWord="ATELIER"
        description={`Explore our curated line of ${cleanSlug} handcrafted with GOTS certified organic materials, luxury tailoring, and Scandinavian design.`}
        totalProducts={displayProducts.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ProductGrid products={displayProducts} />
      </main>
      <Footer />
    </>
  );
}
