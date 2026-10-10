'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { ProductGrid } from '../../components/products/ProductGrid';
import { CategoryHeaderBanner } from '../../components/layout/CategoryHeaderBanner';
import { INITIAL_PRODUCTS } from '../../hooks/useCart';

function BabyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category') || 'all';

  const [activeSub, setActiveSub] = useState(categoryParam);

  useEffect(() => {
    setActiveSub(categoryParam);
  }, [categoryParam]);

  const handleSelectSub = (val: string) => {
    setActiveSub(val);
    if (val === 'all') {
      router.push('/baby');
    } else {
      router.push(`/baby?category=${encodeURIComponent(val)}`);
    }
  };

  // Filter products for Baby / Newborn
  const babyProducts = INITIAL_PRODUCTS.filter((product) => {
    const isBabyProduct =
      product.category.name.toLowerCase().includes('baby') ||
      product.category.name.toLowerCase().includes('newborn') ||
      product.category.slug.toLowerCase().includes('baby') ||
      product.category.slug.toLowerCase().includes('newborn') ||
      product.name.toLowerCase().includes('onesie') ||
      product.name.toLowerCase().includes('organic') ||
      product.name.toLowerCase().includes('swaddle') ||
      product.name.toLowerCase().includes('romper') ||
      product.name.toLowerCase().includes('suit');

    if (!isBabyProduct) return false;

    if (activeSub && activeSub.toLowerCase() !== 'all') {
      const subMatch =
        product.name.toLowerCase().includes(activeSub.toLowerCase()) ||
        product.category.name.toLowerCase().includes(activeSub.toLowerCase()) ||
        product.category.slug.toLowerCase().includes(activeSub.toLowerCase());
      if (!subMatch) return false;
    }

    return true;
  });

  const subCategories = [
    { name: 'All Newborn', value: 'all', icon: '🌸' },
    { name: 'Essentials', value: 'essentials', icon: '✨' },
    { name: 'Bodysuits', value: 'bodysuits', icon: '👶' },
    { name: 'Rompers', value: 'rompers', icon: '🌿' },
    { name: 'Sleepsuits', value: 'sleepsuits', icon: '☁️' },
    { name: 'Swaddles', value: 'swaddles', icon: '🧸' },
    { name: 'Gift Sets', value: 'gift-sets', icon: '🎁' },
  ];

  const displayTitle =
    activeSub && activeSub !== 'all'
      ? `NEWBORN ${activeSub.toUpperCase()}`
      : 'NEWBORN & INFANT';

  return (
    <>
      <CategoryHeaderBanner
        badge="FIRST LITTLE MOMENTS (0-24M) 🌸"
        title={displayTitle}
        highlightWord="ESSENTIALS"
        description="Ultra-soft GOTS certified organic cashmere bodysuits, French linen swaddles, hypoallergenic nursery textiles, and newborn welcome gift sets."
        activeSubCategory={activeSub}
        subCategories={subCategories}
        onSelectSubCategory={handleSelectSub}
        totalProducts={babyProducts.length > 0 ? babyProducts.length : INITIAL_PRODUCTS.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ProductGrid products={babyProducts.length > 0 ? babyProducts : INITIAL_PRODUCTS} />
      </main>
    </>
  );
}

export default function BabyPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="py-20 text-center font-heading font-extrabold text-slate-400">Loading newborn essentials...</div>}>
        <BabyContent />
      </Suspense>
      <Footer />
    </>
  );
}
