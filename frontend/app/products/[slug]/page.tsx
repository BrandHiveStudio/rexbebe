import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGallery } from '../../../components/products/ProductGallery';
import { ProductInfo } from '../../../components/products/ProductInfo';
import { ProductReviews } from '../../../components/products/ProductReviews';
import { INITIAL_PRODUCTS } from '../../../data/products';
import { ProductJsonLd, BreadcrumbJsonLd } from '../../../components/seo/JsonLd';
import { generateProductMetadata, SITE_URL } from '../../../config/seoConfig';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | REXBEBE',
      description: 'The requested baby boutique item could not be found.',
      robots: { index: false, follow: false },
    };
  }

  return generateProductMetadata(product);
}

export default function ProductDetailPage({ params }: Props) {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: product.category?.name || 'Baby Clothes', url: `/categories/${product.category?.slug || 'baby-clothing'}` },
    { name: product.name, url: `/products/${product.slug}` },
  ];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Header />
      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Semantic breadcrumb navigation in page */}
        <nav aria-label="Breadcrumb" className="text-xs text-stone-500 mb-4">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((b, idx) => (
              <li key={b.url} className="flex items-center space-x-2">
                {idx > 0 && <span className="text-stone-300">/</span>}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-purple-950 font-semibold truncate max-w-xs">{b.name}</span>
                ) : (
                  <a href={b.url} className="hover:text-pink-600 transition-colors">
                    {b.name}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} productName={product.name} />
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
