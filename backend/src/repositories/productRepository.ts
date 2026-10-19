import fs from 'fs';
import path from 'path';
import { CategoryRepository } from './categoryRepository';

export interface ProductPartImage {
  id?: string;
  colorName?: string;
  sizeName?: string;
  url: string;
  alt?: string;
  isRecolored?: boolean;
  recolorSourceUrl?: string;
}

export interface ProductPart {
  id: string;
  name: string;
  type: 'T-shirt' | 'Shirt' | 'Pants' | 'Shorts' | 'Dress' | 'Romper' | 'Hat' | 'Jacket' | 'Other';
  description?: string;
  colors: ProductColorOption[];
  defaultColor?: string;
  images?: ProductPartImage[];
  active: boolean;
  isPurchasableIndividually?: boolean;
  price?: number;
  comparePrice?: number;
  skuPrefix?: string;
  sizes?: string[];
  maskUrl?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  partColors?: Record<string, string>;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  partId?: string;
  partName?: string;
  purchaseType?: 'complete_set' | 'individual_part';
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  partName?: string;
  colorName?: string;
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

export interface ProductRecord {
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
  productType?: 'single' | 'set';
  parts?: ProductPart[];
  gender?: 'Baby' | 'Girls' | 'Boys' | 'Unisex';
  ageGroup?: string;
  category: { id: string; name: string; slug: string };
  subcategory?: { id: string; name: string; slug: string };
  collection?: { id: string; name: string; slug: string };
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

const STORAGE_FILE_PATH = path.resolve(__dirname, '../../data/products.json');

export class ProductRepository {
  private products: ProductRecord[] = [];

  constructor() {
    this.products = this.loadFromDisk();
  }

  private loadFromDisk(): ProductRecord[] {
    try {
      if (fs.existsSync(STORAGE_FILE_PATH)) {
        const raw = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[ProductRepository] Error loading products from disk:', err);
    }
    return [];
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(STORAGE_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(this.products, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ProductRepository] Error saving products to disk:', err);
    }
  }

  async findAll(query?: any): Promise<ProductRecord[]> {
    // Reload from disk to catch external changes
    this.products = this.loadFromDisk();
    let result = [...this.products];

    if (query?.category) {
      const cat = String(query.category).toLowerCase().trim();
      const targetIds = new Set<string>([cat]);
      const assignedProdIds = new Set<string>();

      try {
        const catRepo = CategoryRepository.getInstance();
        const found = catRepo.findById(query.category) || catRepo.findBySlug(query.category);
        if (found) {
          targetIds.add(found.id.toLowerCase());
          targetIds.add(found.slug.toLowerCase());
          targetIds.add(found.name.toLowerCase());
          if (Array.isArray(found.assignedProductIds)) {
            found.assignedProductIds.forEach((pid) => assignedProdIds.add(pid));
          }
          const descendants = catRepo.getDescendants(found.id);
          for (const d of descendants) {
            targetIds.add(d.id.toLowerCase());
            targetIds.add(d.slug.toLowerCase());
            targetIds.add(d.name.toLowerCase());
            if (Array.isArray(d.assignedProductIds)) {
              d.assignedProductIds.forEach((pid) => assignedProdIds.add(pid));
            }
          }
        }
      } catch (err) {
        console.warn('[ProductRepository] Error resolving category descendants:', err);
      }

      result = result.filter((p) => {
        if (assignedProdIds.has(p.id)) return true;
        const pCatId = p.category?.id?.toLowerCase();
        const pCatSlug = p.category?.slug?.toLowerCase();
        const pCatName = p.category?.name?.toLowerCase();
        const pSubId = p.subcategory?.id?.toLowerCase();
        const pSubSlug = p.subcategory?.slug?.toLowerCase();
        const pSubName = p.subcategory?.name?.toLowerCase();

        return (
          (pCatId && targetIds.has(pCatId)) ||
          (pCatSlug && targetIds.has(pCatSlug)) ||
          (pCatName && targetIds.has(pCatName)) ||
          (pSubId && targetIds.has(pSubId)) ||
          (pSubSlug && targetIds.has(pSubSlug)) ||
          (pSubName && targetIds.has(pSubName))
        );
      });
    }

    if (query?.status) {
      result = result.filter((p) => p.status === query.status);
    }

    if (query?.featured === 'true') {
      result = result.filter((p) => p.isFeatured);
    }

    if (query?.bestseller === 'true') {
      result = result.filter((p) => p.isBestSeller);
    }

    if (query?.newarrival === 'true') {
      result = result.filter((p) => p.isNewArrival);
    }

    if (query?.sale === 'true') {
      result = result.filter((p) => p.comparePrice && p.comparePrice > p.price);
    }

    if (query?.gender) {
      const gen = String(query.gender).toLowerCase();
      result = result.filter(
        (p) =>
          p.gender?.toLowerCase() === gen ||
          p.gender?.toLowerCase() === 'unisex' ||
          p.name.toLowerCase().includes(gen)
      );
    }

    if (query?.search) {
      const search = String(query.search).toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.sku?.toLowerCase().includes(search) ||
          p.category.name.toLowerCase().includes(search)
      );
    }

    return result;
  }

  async findBySlug(slug: string): Promise<ProductRecord | null> {
    this.products = this.loadFromDisk();
    const product = this.products.find((p) => p.slug === slug);
    return product || null;
  }

  async findById(id: string): Promise<ProductRecord | null> {
    this.products = this.loadFromDisk();
    const product = this.products.find((p) => p.id === id);
    return product || null;
  }

  async create(data: any): Promise<ProductRecord> {
    this.products = this.loadFromDisk();
    const id = data.id || `prod-${Date.now()}`;
    const baseSlug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (this.products.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const price = Number(data.price) || 0;
    const comparePrice =
      data.comparePrice && Number(data.comparePrice) > price ? Number(data.comparePrice) : undefined;
    const discountPercentage =
      comparePrice && comparePrice > price
        ? Math.round((1 - price / comparePrice) * 100)
        : undefined;

    const newProduct: ProductRecord = {
      id,
      name: data.name,
      slug,
      sku: data.sku || `REX-${slug.substring(0, 6).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      shortDescription: data.shortDescription || data.description?.slice(0, 100) || '',
      description: data.description || '',
      price,
      comparePrice,
      discountPercentage,
      saleStartDate: data.saleStartDate,
      saleEndDate: data.saleEndDate,
      isFeatured: Boolean(data.isFeatured),
      isNewArrival: data.isNewArrival ?? true,
      isBestSeller: Boolean(data.isBestSeller),
      isSaleBadge: Boolean(data.isSaleBadge || (comparePrice && comparePrice > price)),
      status: data.status || 'published',
      brand: data.brand || 'REXBEBE Atelier',
      gender: data.gender || 'Baby',
      ageGroup: data.ageGroup || '0–3 months',
      category: data.category || { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing' },
      subcategory: data.subcategory,
      collection: data.collection,
      images:
        data.images && data.images.length > 0
          ? data.images
          : [{ id: `img-${Date.now()}`, url: '/images/products/organic-onesie.jpg', alt: data.name, position: 1 }],
      variants:
        data.variants && data.variants.length > 0
          ? data.variants
          : [
              {
                id: `var-${Date.now()}`,
                sku: `${slug.substring(0, 4).toUpperCase()}-STD`,
                size: 'Standard',
                color: 'Natural',
                colorHex: '#E6DFD5',
                price,
                stockQuantity: Number(data.stockQuantity) || 20,
              },
            ],
      colors: data.colors,
      sizes: data.sizes,
      stockQuantity: Number(data.stockQuantity) || 20,
      lowStockThreshold: Number(data.lowStockThreshold) || 5,
      stockStatus: data.stockStatus || 'in_stock',
      fabricMaterial: data.fabricMaterial || '100% GOTS Certified Organic Cotton',
      careInstructions: data.careInstructions || 'Gentle machine wash with cold water. Line dry in shade.',
      countryOfOrigin: data.countryOfOrigin || 'Sri Lanka',
      weight: data.weight || '160g',
      features: data.features || ['Ultra-soft organic fabric', 'Nickel-free buttons', 'Gentle seams'],
      rating: data.rating || 5.0,
      reviewCount: data.reviewCount || 1,
      reviewsList: data.reviewsList || [],
      productType: data.productType || 'single',
      parts: data.parts || [],
      seoTitle: data.seoTitle || `${data.name} | REXBEBE Baby Clothing`,
      seoDescription: data.seoDescription || data.shortDescription || data.description?.slice(0, 150),
    };

    this.products.unshift(newProduct);
    this.saveToDisk();
    return newProduct;
  }

  async update(id: string, updateData: any): Promise<ProductRecord | null> {
    this.products = this.loadFromDisk();
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const current = this.products[idx];
    const price = updateData.price !== undefined ? Number(updateData.price) : current.price;
    const comparePrice =
      updateData.comparePrice !== undefined
        ? updateData.comparePrice && Number(updateData.comparePrice) > price
          ? Number(updateData.comparePrice)
          : undefined
        : current.comparePrice;

    const discountPercentage =
      comparePrice && comparePrice > price
        ? Math.round((1 - price / comparePrice) * 100)
        : undefined;

    this.products[idx] = {
      ...current,
      ...updateData,
      price,
      comparePrice,
      discountPercentage,
    };

    this.saveToDisk();
    return this.products[idx];
  }

  async duplicate(id: string): Promise<ProductRecord | null> {
    this.products = this.loadFromDisk();
    const original = this.products.find((p) => p.id === id);
    if (!original) return null;

    const newId = `prod-${Date.now()}`;
    const baseSlug = `${original.slug}-copy`;
    let slug = baseSlug;
    let counter = 1;
    while (this.products.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const duplicated: ProductRecord = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      slug,
      sku: `${original.sku || 'REX'}-COPY-${Math.floor(Math.random() * 900 + 100)}`,
      status: 'draft',
      images: original.images.map((img, idx) => ({
        ...img,
        id: `img-${Date.now()}-${idx}`,
      })),
      variants: original.variants.map((v, idx) => ({
        ...v,
        id: `var-${Date.now()}-${idx}`,
        sku: `${v.sku}-CPY`,
      })),
      rating: 5.0,
      reviewCount: 0,
      reviewsList: [],
    };

    this.products.unshift(duplicated);
    this.saveToDisk();
    return duplicated;
  }

  async delete(id: string): Promise<boolean> {
    this.products = this.loadFromDisk();
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    const removedProduct = this.products[idx];
    this.products.splice(idx, 1);
    this.saveToDisk();

    // Clean up references in collections.json
    try {
      const collectionsFilePath = path.resolve(__dirname, '../../data/collections.json');
      if (fs.existsSync(collectionsFilePath)) {
        const collections = JSON.parse(fs.readFileSync(collectionsFilePath, 'utf-8'));
        let modified = false;
        collections.forEach((c: any) => {
          if (Array.isArray(c.assignedProductIds) && c.assignedProductIds.includes(id)) {
            c.assignedProductIds = c.assignedProductIds.filter((pId: string) => pId !== id);
            modified = true;
          }
        });
        if (modified) {
          fs.writeFileSync(collectionsFilePath, JSON.stringify(collections, null, 2), 'utf-8');
        }
      }
    } catch (collErr) {
      console.warn('[ProductRepository] Notice cleaning up collections references:', collErr);
    }

    // Clean up references in navigation.json
    try {
      const navigationFilePath = path.resolve(__dirname, '../../data/navigation.json');
      if (fs.existsSync(navigationFilePath)) {
        const nav = JSON.parse(fs.readFileSync(navigationFilePath, 'utf-8'));
        let navModified = false;
        (nav.items || []).forEach((item: any) => {
          if (Array.isArray(item.assignedProductIds) && item.assignedProductIds.includes(id)) {
            item.assignedProductIds = item.assignedProductIds.filter((pId: string) => pId !== id);
            navModified = true;
          }
          (item.subGroups || []).forEach((grp: any) => {
            (grp.subItems || []).forEach((sub: any) => {
              if (Array.isArray(sub.assignedProductIds) && sub.assignedProductIds.includes(id)) {
                sub.assignedProductIds = sub.assignedProductIds.filter((pId: string) => pId !== id);
                navModified = true;
              }
            });
          });
        });
        if (navModified) {
          fs.writeFileSync(navigationFilePath, JSON.stringify(nav, null, 2), 'utf-8');
        }
      }
    } catch (navErr) {
      console.warn('[ProductRepository] Notice cleaning up navigation references:', navErr);
    }

    // Record audit log
    try {
      const auditFilePath = path.resolve(__dirname, '../../data/audit_logs.json');
      const logs = fs.existsSync(auditFilePath) ? JSON.parse(fs.readFileSync(auditFilePath, 'utf-8')) : [];
      logs.unshift({
        id: `log-${Date.now()}`,
        userEmail: 'admin@rexbebe.com',
        userName: 'Admin Executive',
        action: 'PRODUCT_DELETE',
        details: `Permanently deleted product "${removedProduct.name}" (${removedProduct.sku || id})`,
        ip: '127.0.0.1',
        timestamp: new Date().toISOString(),
      });
      if (logs.length > 500) logs.pop();
      fs.writeFileSync(auditFilePath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (auditErr) {
      console.warn('[ProductRepository] Notice recording audit log:', auditErr);
    }

    return true;
  }

  async toggleBestSeller(id: string): Promise<ProductRecord | null> {
    this.products = this.loadFromDisk();
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;
    product.isBestSeller = !product.isBestSeller;
    this.saveToDisk();
    return product;
  }

  async toggleNewArrival(id: string): Promise<ProductRecord | null> {
    this.products = this.loadFromDisk();
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;
    product.isNewArrival = !product.isNewArrival;
    this.saveToDisk();
    return product;
  }

  async toggleFeatured(id: string): Promise<ProductRecord | null> {
    this.products = this.loadFromDisk();
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;
    product.isFeatured = !product.isFeatured;
    this.saveToDisk();
    return product;
  }

  async updateStatus(id: string, status: 'draft' | 'published' | 'unpublished'): Promise<ProductRecord | null> {
    this.products = this.loadFromDisk();
    const product = this.products.find((p) => p.id === id);
    if (!product) return null;
    product.status = status;
    this.saveToDisk();
    return product;
  }
}
