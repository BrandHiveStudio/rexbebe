export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller?: boolean;
  category: { id: string; name: string; slug: string };
  collection?: { id: string; name: string; slug: string };
  images: { id: string; url: string; alt: string; position: number }[];
  variants: {
    id: string;
    sku: string;
    size?: string;
    color?: string;
    colorHex?: string;
    price: number;
    stockQuantity: number;
  }[];
  rating: number;
  reviewCount: number;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-1',
    name: 'Aurelia Organic Cashmere Romper',
    slug: 'aurelia-organic-cashmere-romper',
    description: 'Crafted from 100% GOTS certified organic Mongolian cashmere, the Aurelia romper offers unparalleled softness and delicate breathability for newborn skin. Features mother-of-pearl buttons and expandable envelope neckline.',
    price: 18500,
    comparePrice: 22000,
    isFeatured: true,
    isNewArrival: true,
    category: { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing' },
    collection: { id: 'coll-autumn', name: 'Autumn Atelier Collection', slug: 'autumn-atelier' },
    images: [
      { id: 'img-1', url: '/images/products/organic-onesie.jpg', alt: 'Aurelia Cashmere Romper', position: 1 },
      { id: 'img-2', url: '/images/products/hero-nursery.jpg', alt: 'Nursery View', position: 2 }
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
      { id: 'img-3', url: '/images/products/wooden-gym.jpg', alt: 'Nordic Wooden Play Gym', position: 1 }
    ],
    variants: [
      { id: 'var-2a', sku: 'GYM-WOOD-STD', size: 'One Size', color: 'Natural Beech', colorHex: '#D4B895', price: 24500, stockQuantity: 14 }
    ],
    rating: 5.0,
    reviewCount: 38
  },
  {
    id: 'prod-3',
    name: 'Maison Luxe Organic Linen Swaddle Set',
    slug: 'maison-luxe-organic-linen-swaddle-set',
    description: 'Triple-washed French flax linen swaddle blanket set. Lightweight, thermoregulating, and grows softer with every wash. Set includes 2 swaddles and a matching knot beanie.',
    price: 14200,
    comparePrice: 16500,
    isFeatured: true,
    isNewArrival: false,
    category: { id: 'cat-essentials', name: 'Bedding & Swaddles', slug: 'bedding-swaddles' },
    collection: { id: 'coll-autumn', name: 'Autumn Atelier Collection', slug: 'autumn-atelier' },
    images: [
      { id: 'img-4', url: '/images/products/hero-nursery.jpg', alt: 'Linen Swaddle Set', position: 1 }
    ],
    variants: [
      { id: 'var-3a', sku: 'SWAD-SAGE-SET', size: '120x120cm', color: 'Sage Green', colorHex: '#9BA88D', price: 14200, stockQuantity: 30 },
      { id: 'var-3b', sku: 'SWAD-CREAM-SET', size: '120x120cm', color: 'Ivory Cream', colorHex: '#FDFBF7', price: 14200, stockQuantity: 22 }
    ],
    rating: 4.8,
    reviewCount: 29
  },
  {
    id: 'prod-4',
    name: 'Celeste Convertible Ergonomic Stroller',
    slug: 'celeste-convertible-ergonomic-stroller',
    description: 'Modular high-landscape stroller with aircraft-grade aluminum frame, shock-absorbing all-terrain wheels, and eco-leather touchpoints. Suitable from birth to 22kg.',
    price: 189000,
    comparePrice: 210000,
    isFeatured: true,
    isNewArrival: true,
    category: { id: 'cat-gear', name: 'Baby Gear & Travel', slug: 'gear-travel' },
    collection: { id: 'coll-travel', name: 'Travel Luxury Series', slug: 'travel-luxury' },
    images: [
      { id: 'img-5', url: '/images/products/hero-nursery.jpg', alt: 'Celeste Stroller', position: 1 }
    ],
    variants: [
      { id: 'var-4a', sku: 'STR-ONYX-GLD', color: 'Onyx Black & Rose Gold', colorHex: '#1A1A1A', price: 189000, stockQuantity: 8 },
      { id: 'var-4b', sku: 'STR-SAND-SLV', color: 'Desert Sand & Chrome', colorHex: '#C5B39B', price: 189000, stockQuantity: 5 }
    ],
    rating: 4.95,
    reviewCount: 16
  }
];

export class ProductRepository {
  async findAll(query?: any): Promise<MockProduct[]> {
    let products = [...MOCK_PRODUCTS];
    if (query?.category) {
      products = products.filter(p => p.category.slug === query.category);
    }
    if (query?.featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }
    if (query?.search) {
      const search = query.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }
    return products;
  }

  async findBySlug(slug: string): Promise<MockProduct | null> {
    const product = MOCK_PRODUCTS.find(p => p.slug === slug);
    return product || null;
  }

  async findById(id: string): Promise<MockProduct | null> {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    return product || null;
  }

  async create(data: any): Promise<MockProduct> {
    const id = data.id || `prod-${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct: MockProduct = {
      ...data,
      id,
      slug,
      isFeatured: data.isFeatured ?? false,
      isNewArrival: data.isNewArrival ?? true,
      isBestSeller: data.isBestSeller ?? false,
      rating: data.rating || 5.0,
      reviewCount: data.reviewCount || 1,
      images: data.images || [{ id: `img-${Date.now()}`, url: '/images/products/organic-onesie.jpg', alt: data.name, position: 1 }],
      variants: data.variants || [{ id: `var-${Date.now()}`, sku: `${slug.substring(0, 4).toUpperCase()}-STD`, price: data.price, stockQuantity: 20 }],
    };
    MOCK_PRODUCTS.unshift(newProduct);
    return newProduct;
  }

  async update(id: string, updateData: any): Promise<MockProduct | null> {
    const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (idx === -1) return null;
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...updateData };
    return MOCK_PRODUCTS[idx];
  }

  async delete(id: string): Promise<boolean> {
    const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (idx === -1) return false;
    MOCK_PRODUCTS.splice(idx, 1);
    return true;
  }

  async toggleBestSeller(id: string): Promise<MockProduct | null> {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (!product) return null;
    product.isBestSeller = !product.isBestSeller;
    return product;
  }
}
