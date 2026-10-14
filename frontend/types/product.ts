export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  price: number;
  stockQuantity: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface ProductColorOption {
  name: string;
  hex: string;
}

export interface ProductReviewItem {
  id: string;
  author: string;
  location?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified?: boolean;
  fit?: string;
  helpfulCount?: number;
  status?: 'approved' | 'pending' | 'rejected';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  shortDescription?: string;
  description: string;
  price: number;
  comparePrice?: number;
  discountPercentage?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller?: boolean;
  isSaleBadge?: boolean;
  status?: 'draft' | 'published' | 'unpublished';
  brand?: string;
  gender?: 'Baby' | 'Girls' | 'Boys' | 'Unisex';
  ageGroup?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
  collection?: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
  colors?: ProductColorOption[];
  sizes?: string[];
  stockQuantity?: number;
  lowStockThreshold?: number;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  fabricMaterial?: string;
  careInstructions?: string;
  countryOfOrigin?: string;
  weight?: string;
  features?: string[];
  rating: number;
  reviewCount: number;
  reviewsList?: ProductReviewItem[];
  seoTitle?: string;
  seoDescription?: string;
}

