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

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  category: {
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
  rating: number;
  reviewCount: number;
}
