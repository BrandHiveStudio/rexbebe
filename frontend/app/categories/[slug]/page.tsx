import React from 'react';
import type { Metadata } from 'next';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGrid } from '../../../components/products/ProductGrid';
import { CategoryHeaderBanner } from '../../../components/layout/CategoryHeaderBanner';
import { INITIAL_PRODUCTS } from '../../../data/products';
import { BreadcrumbJsonLd, ItemListJsonLd } from '../../../components/seo/JsonLd';
import { generateCategoryMetadata, SITE_URL } from '../../../config/seoConfig';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cleanSlug = params.slug.replace(/-/g, ' ');
  const title = cleanSlug.replace(/\b\w/g, (l) => l.toUpperCase());

  return generateCategoryMetadata({
    title: `${title} - Baby Collection`,
    description: `Shop our curated collection of luxury ${cleanSlug} for babies and toddlers at REXBEBE. Crafted with certified organic cashmere, pure linen, and gentle pastel hues.`,
    path: `/categories/${params.slug}`,
  });
}

export default function CategoryPage({ params }: Props) {
  const cleanSlug = params.slug.replace(/-/g, ' ');
  const formattedTitle = cleanSlug.toUpperCase();

  const filtered = INITIAL_PRODUCTS.filter(
    (p) =>
      p.category.slug.toLowerCase().includes(params.slug.toLowerCase()) ||
      p.category.name.toLowerCase().includes(cleanSlug.toLowerCase()) ||
      p.name.toLowerCase().includes(cleanSlug.toLowerCase())
  );

  const displayProducts = filtered.length > 0 ? filtered : INITIAL_PRODUCTS;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: cleanSlug.replace(/\b\w/g, (l) => l.toUpperCase()), url: `/categories/${params.slug}` },
  ];

  const itemList = displayProducts.map((p, idx) => ({
    name: p.name,
    url: `/products/${p.slug}`,
    image: p.images?.[0]?.url,
    position: idx + 1,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        name={`${cleanSlug.replace(/\b\w/g, (l) => l.toUpperCase())} Collection`}
        itemListElement={itemList}
      />
      <Header />
      <CategoryHeaderBanner
        badge="DEDICATED CATEGORY SELECTION 🌸"
        title={formattedTitle}
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
