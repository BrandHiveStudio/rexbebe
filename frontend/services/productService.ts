import { fetchApi } from './api';
import { Product } from '../types/product';

export const productService = {
  async getProducts(params?: Record<string, string>): Promise<Product[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<Product[]>(`/products${query}`);
  },

  async getProductBySlug(slug: string): Promise<Product> {
    return fetchApi<Product>(`/products/${slug}`);
  },

  async getCategories(): Promise<any[]> {
    return fetchApi<any[]>('/categories');
  }
};
