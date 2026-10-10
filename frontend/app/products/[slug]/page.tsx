'use client';

import React from 'react';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGallery } from '../../../components/products/ProductGallery';
import { ProductInfo } from '../../../components/products/ProductInfo';
import { ProductReviews } from '../../../components/products/ProductReviews';
import { INITIAL_PRODUCTS } from '../../../hooks/useCart';
import { ProductJsonLd, BreadcrumbJsonLd } from '../../../components/seo/JsonLd';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = INITIAL_PRODUCTS.find(p => p.slug === params.slug) || INITIAL_PRODUCTS[0];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://rexbebe.com' },
          { name: 'Shop', url: 'https://rexbebe.com/shop' },
          { name: product.name, url: `https://rexbebe.com/products/${product.slug}` },
        ]}
      />
      <Header />
      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} />
          </div>
          <div className="lg:col-span-6">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Parent Reviews & UGC Section */}
        <ProductReviews />
      </main>
      <Footer />
    </>
  );
}
