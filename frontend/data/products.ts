import { Product } from '../types/product';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aurelia Organic Cashmere Romper',
    slug: 'aurelia-organic-cashmere-romper',
    description: 'Crafted from 100% GOTS certified organic Mongolian cashmere, the Aurelia romper offers unparalleled softness and delicate breathability for newborn skin.',
    price: 18500,
    comparePrice: 22000,
    isFeatured: true,
    isNewArrival: true,
    category: { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing' },
    collection: { id: 'coll-autumn', name: 'Autumn Atelier Collection', slug: 'autumn-atelier' },
    images: [
      { id: 'img-1', url: '/images/products/baby-girl-fashion.jpg', alt: 'Aurelia Cashmere Romper in oatmeal tone', position: 1 },
      { id: 'img-2', url: '/images/products/hero-nursery.jpg', alt: 'Nursery View and cashmere swaddle', position: 2 }
    ],
    variants: [
      { id: 'var-1a', sku: 'AUREL-OAT-03M', size: '0-3 Months', color: 'Oatmeal', colorHex: '#E6DFD5', price: 18500, stockQuantity: 25 },
      { id: 'var-1b', sku: 'AUREL-OAT-06M', size: '3-6 Months', color: 'Oatmeal', colorHex: '#E6DFD5', price: 18500, stockQuantity: 18 },
      { id: 'var-1c', sku: 'AUREL-ROSE-03M', size: '0-3 Months', color: 'Dusty Rose', colorHex: '#D8B4A6', price: 18500, stockQuantity: 12 },
    ],
    rating: 4.9,
    reviewCount: 42
  },
  {
    id: 'prod-2',
    name: 'Nordic Artisan Wooden Play Gym',
    slug: 'nordic-artisan-wooden-play-gym',
    description: 'Handcrafted from solid sustainable beechwood with organic unvarnished finish. Includes 3 detachable hand-crocheted sensory toys with subtle rattles to stimulate motor development.',
    price: 24500,
    comparePrice: 28000,
    isFeatured: true,
    isNewArrival: true,
    category: { id: 'cat-toys', name: 'Nursery & Toys', slug: 'nursery-toys' },
    collection: { id: 'coll-nordic', name: 'Scandinavian Nursery', slug: 'scandinavian-nursery' },
    images: [
      { id: 'img-3', url: '/images/products/wooden-gym.jpg', alt: 'Nordic Wooden Play Gym natural beechwood frame', position: 1 }
    ],
    variants: [
      { id: 'var-2a', sku: 'GYM-WOOD-STD', size: 'One Size', color: 'Natural Beech', colorHex: '#D4B895', price: 24500, stockQuantity: 14 }
    ],
    rating: 5.0,
    reviewCount: 38
  },
  {
    id: 'prod-3',
    name: 'Maison Luxe Organic Linen Set',
    slug: 'maison-luxe-organic-linen-swaddle-set',
    description: 'Triple-washed French flax linen shirt and shorts set. Lightweight, thermoregulating, and grows softer with every wash.',
    price: 14200,
    comparePrice: 16500,
    isFeatured: true,
    isNewArrival: true,
    category: { id: 'cat-essentials', name: 'Bedding & Swaddles', slug: 'bedding-swaddles' },
    collection: { id: 'coll-autumn', name: 'Autumn Atelier Collection', slug: 'autumn-atelier' },
    images: [
      { id: 'img-4', url: '/images/products/baby-boy-fashion.jpg', alt: 'French flax linen set in powder blue', position: 1 }
    ],
    variants: [
      { id: 'var-3a', sku: 'SWAD-SAGE-SET', size: '120x120cm', color: 'Powder Blue', colorHex: '#BAE6FD', price: 14200, stockQuantity: 30 },
      { id: 'var-3b', sku: 'SWAD-CREAM-SET', size: '120x120cm', color: 'Ivory Cream', colorHex: '#FDFBF7', price: 14200, stockQuantity: 22 }
    ],
    rating: 4.8,
    reviewCount: 29
  },
  {
    id: 'prod-4',
    name: 'Celeste Convertible Ergonomic Stroller',
    slug: 'celeste-convertible-ergonomic-stroller',
    description: 'Modular high-landscape stroller with aircraft-grade aluminum frame, shock-absorbing all-terrain wheels, and eco-leather touchpoints.',
    price: 189000,
    comparePrice: 210000,
    isFeatured: true,
    isNewArrival: true,
    category: { id: 'cat-gear', name: 'Baby Gear & Travel', slug: 'gear-travel' },
    collection: { id: 'coll-travel', name: 'Travel Luxury Series', slug: 'travel-luxury' },
    images: [
      { id: 'img-5', url: '/images/products/hero-nursery.jpg', alt: 'Celeste Stroller with luxury gold accents', position: 1 }
    ],
    variants: [
      { id: 'var-4a', sku: 'STR-ONYX-GLD', color: 'Onyx Black & Rose Gold', colorHex: '#1A1A1A', price: 189000, stockQuantity: 8 },
      { id: 'var-4b', sku: 'STR-SAND-SLV', color: 'Desert Sand & Chrome', colorHex: '#C5B39B', price: 189000, stockQuantity: 5 }
    ],
    rating: 4.95,
    reviewCount: 16
  },
  {
    id: 'prod-5',
    name: 'Petit Prince Cashmere Cardigan & Bonnet Set',
    slug: 'petit-prince-cashmere-cardigan-bonnet-set',
    description: 'Delicate hand-stitched pearl buttons with plush Mongolian cashmere cable-knit cardigan and matching ears bonnet.',
    price: 16500,
    comparePrice: 19500,
    isFeatured: true,
    isNewArrival: true,
    category: { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing' },
    collection: { id: 'coll-autumn', name: 'Autumn Atelier Collection', slug: 'autumn-atelier' },
    images: [
      { id: 'img-6', url: '/images/products/organic-onesie.jpg', alt: 'Petit Prince Cashmere Cardigan and ear bonnet', position: 1 }
    ],
    variants: [
      { id: 'var-5a', sku: 'CARD-ROSE-03M', size: '0-3 Months', color: 'Dusty Rose', colorHex: '#E8C5C8', price: 16500, stockQuantity: 15 },
      { id: 'var-5b', sku: 'CARD-BLUE-06M', size: '3-6 Months', color: 'Powder Blue', colorHex: '#B9E3F7', price: 16500, stockQuantity: 12 }
    ],
    rating: 4.9,
    reviewCount: 34
  }
];
