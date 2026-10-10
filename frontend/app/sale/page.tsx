'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { ProductGrid } from '../../components/products/ProductGrid';
import { CategoryHeaderBanner } from '../../components/layout/CategoryHeaderBanner';
import { INITIAL_PRODUCTS } from '../../hooks/useCart';

function SaleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category') || searchParams.get('discount') || 'all';

  const [activeSub, setActiveSub] = useState(categoryParam);

  useEffect(() => {
    setActiveSub(categoryParam);
  }, [categoryParam]);

  const handleSelectSub = (val: string) => {
    setActiveSub(val);
    if (val === 'all') {
      router.push('/sale');
    } else {
      router.push(`/sale?category=${encodeURIComponent(val)}`);
    }
  };

  const saleProducts = INITIAL_PRODUCTS.map((p) => ({
    ...p,
    comparePrice: p.comparePrice || Math.round(p.price * 1.25),
  })).filter((product) => {
    if (activeSub && activeSub.toLowerCase() !== 'all') {
      return (
        product.name.toLowerCase().includes(activeSub.toLowerCase()) ||
        product.category.name.toLowerCase().includes(activeSub.toLowerCase())
      );
    }
    return true;
  });

  const subCategories = [
    { name: 'All Sale', value: 'all', icon: '🔥' },
    { name: 'Baby Girls Sale', value: 'Girl', icon: '👑' },
    { name: 'Baby Boys Sale', value: 'Boy', icon: '🦕' },
    { name: 'Newborn Sale', value: 'Newborn', icon: '🌸' },
    { name: '20-30% Off', value: '20-30', icon: '🏷️' },
    { name: '30-50% Off', value: '30-50', icon: '✨' },
  ];

  const displayTitle =
    activeSub && activeSub !== 'all'
      ? `SALE — ${activeSub.toUpperCase()}`
      : 'PRIVATE ATELIER SALE';

  return (
    <>
      <CategoryHeaderBanner
        badge="LIMITED SEASONAL CLEARANCE 🔥"
        title={displayTitle}
        highlightWord="OFFERS"
        description="Exclusive savings on previous seasonal capsule releases, organic knitwear, and nursery essentials. Limited quantities available."
        activeSubCategory={activeSub}
        subCategories={subCategories}
        onSelectSubCategory={handleSelectSub}
        totalProducts={saleProducts.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ProductGrid products={saleProducts} />
      </main>
    </>
  );
}

export default function SalePage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-20 text-center font-heading font-extrabold text-slate-400">Loading private atelier sale...</div>}>
        <SaleContent />
      </Suspense>
      <Footer />
    </>
  );
}
