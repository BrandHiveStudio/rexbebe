import React from 'react';
import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { ProductDetailView } from '../../../components/products/ProductDetailView';
import { INITIAL_PRODUCTS } from '../../../data/products';
import { generateProductMetadata } from '../../../config/seoConfig';
import { Product } from '../../../types/product';

interface Props {
  params: { slug: string };
}

function getProductFromStorage(slug: string): Product | undefined {
  const cleanSlug = slug.toLowerCase().trim();

  // Try reading from persistent backend data file
  try {
    const filePath = path.resolve(process.cwd(), '../backend/data/products.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const list: Product[] = JSON.parse(raw);
      const match = list.find((p) => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug);
      if (match) return match;
    }
  } catch (e) {
    // ignore
  }

  // Fallback to static catalog
  return INITIAL_PRODUCTS.find((p) => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductFromStorage(params.slug);

  if (!product) {
    const formattedTitle = params.slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      title: `${formattedTitle} | REXBEBE Luxury Baby Boutique`,
      description: 'Explore handpicked luxury baby clothing and nursery essentials at REXBEBE.',
    };
  }

  return generateProductMetadata(product);
}

export default function ProductDetailPage({ params }: Props) {
  const initialProduct = getProductFromStorage(params.slug);

  return (
    <ProductDetailView slug={params.slug} initialProduct={initialProduct} />
  );
}
