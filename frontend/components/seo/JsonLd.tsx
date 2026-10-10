'use client';

import React from 'react';
import { Product } from '../../types/product';

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'REXBEBE',
    url: 'https://rexbebe.com',
    logo: 'https://rexbebe.com/images/logo_clean.png',
    sameAs: [
      'https://instagram.com/rexbebe.atelier',
      'https://facebook.com/rexbebe.atelier',
      'https://pinterest.com/rexbebe',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+94-77-123-4567',
      contactType: 'customer service',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Sinhala'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.description,
    sku: product.variants[0]?.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'REXBEBE',
    },
    offers: {
      '@type': 'Offer',
      url: `https://rexbebe.com/products/${product.slug}`,
      priceCurrency: 'USD',
      price: (product.price * 0.0033).toFixed(2),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.variants.some((v) => v.stockQuantity > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount || 24,
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
