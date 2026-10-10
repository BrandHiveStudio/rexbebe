'use client';

import { useState, useEffect } from 'react';
import { Product } from '../types/product';
import { productService } from '../services/productService';
import { INITIAL_PRODUCTS } from './useCart';

export function useProducts(categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await productService.getProducts(categorySlug ? { category: categorySlug } : undefined);
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (e) {
        console.warn('API offline - fallback to local product state');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySlug]);

  return { products, loading };
}
