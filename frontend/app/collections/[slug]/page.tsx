import React from 'react';
import type { Metadata } from 'next';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { ProductGrid } from '../../../components/products/ProductGrid';
import { INITIAL_PRODUCTS } from '../../../data/products';
import { BreadcrumbJsonLd, ItemListJsonLd } from '../../../components/seo/JsonLd';
import { generateCategoryMetadata } from '../../../config/seoConfig';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cleanTitle = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return generateCategoryMetadata({
    title: `${cleanTitle} Capsule Collection`,
    description: `Discover the ${cleanTitle} capsule collection at REXBEBE. Pure organic cashmere, handcrafted wooden nursery gym sets, and timeless Scandinavian nursery aesthetics.`,
    path: `/collections/${params.slug}`,
  });
}

export default function CollectionPage({ params }: Props) {
  const cleanTitle = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const filtered = INITIAL_PRODUCTS.filter(
    (p) =>
      p.collection?.slug === params.slug ||
      p.collection?.name.toLowerCase().includes(params.slug.toLowerCase())
  );

  const displayProducts = filtered.length > 0 ? filtered : INITIAL_PRODUCTS;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Collections', url: '/collections' },
    { name: cleanTitle, url: `/collections/${params.slug}` },
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
      <ItemListJsonLd name={`${cleanTitle} Collection`} itemListElement={itemList} />
      <Header />
      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-xs text-stone-500 mb-6">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((b, idx) => (
              <li key={b.url} className="flex items-center space-x-2">
                {idx > 0 && <span className="text-stone-300">/</span>}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-purple-950 font-semibold">{b.name}</span>
                ) : (
                  <a href={b.url} className="hover:text-pink-600 transition-colors">
                    {b.name}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">
            Curated Capsule Edition
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1 capitalize">
            {cleanTitle}
          </h1>
          <p className="text-stone-600 text-sm mt-2 font-light">
            Each piece in this collection is ethically produced with gentle certified fabrics, prioritizing comfort and luxury for babies.
          </p>
        </div>

        <ProductGrid products={displayProducts} />
      </main>
      <Footer />
    </>
  );
}
