'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { ProductGrid } from '../../components/products/ProductGrid';
import { CategoryHeaderBanner } from '../../components/layout/CategoryHeaderBanner';
import { INITIAL_PRODUCTS } from '../../hooks/useCart';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category') || 'all';
  const ageParam = searchParams.get('age');
  const filterParam = searchParams.get('filter');

  const [activeSub, setActiveSub] = useState(categoryParam);

  useEffect(() => {
    setActiveSub(categoryParam);
  }, [categoryParam]);

  const handleSelectSub = (val: string) => {
    setActiveSub(val);
    if (val === 'all') {
      router.push('/shop');
    } else {
      router.push(`/shop?category=${encodeURIComponent(val)}`);
    }
  };

  // Filter products based on search params / subcategory selection
  const filteredProducts = INITIAL_PRODUCTS.filter((product) => {
    if (activeSub && activeSub.toLowerCase() !== 'all') {
      const matchCat =
        product.category.name.toLowerCase().includes(activeSub.toLowerCase()) ||
        product.category.slug.toLowerCase().includes(activeSub.toLowerCase()) ||
        product.name.toLowerCase().includes(activeSub.toLowerCase());
      if (!matchCat) return false;
    }

    if (ageParam) {
      // Allow all for demo matching
    }

    if (filterParam === 'best-sellers' && product.rating < 4.8) {
      return false;
    }

    return true;
  });

  const displayTitle =
    activeSub && activeSub !== 'all'
      ? activeSub.toUpperCase()
      : 'THE BOUTIQUE COLLECTION';

  const subCategories = [
    { name: 'All Items', value: 'all', icon: '✨' },
    { name: 'Newborn', value: 'Newborn', icon: '🌸' },
    { name: 'Dresses', value: 'Dresses', icon: '👑' },
    { name: 'Rompers', value: 'Rompers', icon: '🌿' },
    { name: 'Sets', value: 'Sets', icon: '🎀' },
    { name: 'Sleepwear', value: 'Sleepwear', icon: '☁️' },
    { name: 'Toys & Nursery', value: 'Nursery', icon: '🧸' },
  ];

  return (
    <>
      <CategoryHeaderBanner
        badge="COMPLETE BOUTIQUE CATALOG 🛍"
        title={displayTitle}
        highlightWord="COLLECTION"
        description="Explore our complete line of GOTS certified organic cashmere, French flax linen swaddles, handcrafted wooden toys, and luxury atelier looks."
        activeSubCategory={activeSub}
        subCategories={subCategories}
        onSelectSubCategory={handleSelectSub}
        totalProducts={filteredProducts.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ProductGrid products={filteredProducts.length > 0 ? filteredProducts : INITIAL_PRODUCTS} />
      </main>
    </>
  );
}

export default function ShopPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-20 text-center font-heading font-extrabold text-slate-400">Loading boutique collection...</div>}>
        <ShopContent />
      </Suspense>
      <Footer />
    </>
  );
}
