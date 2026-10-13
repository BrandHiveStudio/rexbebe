'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  ArrowUpDown,
  Filter,
  Sparkles,
  PackageOpen,
  Eye,
  Lock,
} from 'lucide-react';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { ProductCard } from './ProductCard';
import { CategoryHeaderBanner } from '../layout/CategoryHeaderBanner';
import { INITIAL_PRODUCTS } from '../../hooks/useCart';
import { useAdminData } from '../../hooks/AdminContext';
import { Product } from '../../types/product';

interface CategoryShoppingTemplateProps {
  slug: string;
  customTitle?: string;
  customDescription?: string;
  customBadge?: string;
  parentName?: string;
  parentUrl?: string;
  previewData?: {
    name?: string;
    pageTitle?: string;
    description?: string;
    shortDescription?: string;
    detailedDescription?: string;
    bannerImage?: string;
    thumbnailImage?: string;
    galleryImages?: string[];
    assignedProductIds?: string[];
    badge?: string;
    status?: string;
  };
  isModalPreview?: boolean;
}

// Curated Category Metadata Dictionary for dynamic matching
const CATEGORY_METADATA: Record<
  string,
  { title: string; badge: string; description: string; highlightWord: string; subCategories?: { name: string; value: string; icon?: string }[] }
> = {
  newborn: {
    title: 'NEWBORN BABY ESSENTIALS',
    badge: 'FIRST MOMENTS ATELIER 🌸',
    description: 'Cloud-soft, hypoallergenic bodysuits, hospital bag sets, and breathable organic swaddles designed for delicate baby skin.',
    highlightWord: 'ESSENTIALS',
    subCategories: [
      { name: 'All Newborn', value: 'all', icon: '✨' },
      { name: 'Bodysuits', value: 'bodysuit', icon: '🌸' },
      { name: 'Rompers', value: 'romper', icon: '🌿' },
      { name: 'Swaddles', value: 'swaddle', icon: '☁️' },
      { name: 'Gift Sets', value: 'gift', icon: '🎁' },
    ],
  },
  'hospital-bag': {
    title: 'HOSPITAL BAG ESSENTIALS',
    badge: 'FIRST MOMENTS ATELIER 🌸',
    description: 'Curated organic cotton bodysuits, gentle mittens, and cloud-soft swaddles for baby’s very first hours and days.',
    highlightWord: 'ESSENTIALS',
  },
  'party-dresses': {
    title: 'PARTY DRESSES',
    badge: 'ROYAL PARTY & OCCASIONS 👑',
    description: 'Beautiful little dresses for birthdays, celebrations and special moments.',
    highlightWord: 'DRESSES',
  },
  'cashmere-cardigans': {
    title: 'CASHMERE CARDIGANS',
    badge: 'HEIRLOOM MONGOLIAN KNITS 🧶',
    description: 'Heirloom Mongolian cashmere knitwear to keep your little one warm, comfortable and stylish.',
    highlightWord: 'CARDIGANS',
  },
  'play-rompers': {
    title: 'PLAY ROMPERS',
    badge: 'ULTRA SOFT EVERYDAY PLAY 🌸',
    description: 'Play-ready organic cotton and linen rompers designed for easy dressing and sunny adventures.',
    highlightWord: 'ROMPERS',
  },
  'all-girls-fashion': {
    title: 'ALL GIRLS FASHION',
    badge: 'ATELIER GIRLS WARDROBE 🎀',
    description: 'Charming dresses, rompers, knitwear, and dreamy twirl-ready outfits for little princesses.',
    highlightWord: 'FASHION',
  },
  'all-boys-fashion': {
    title: 'ALL BOYS FASHION',
    badge: 'LITTLE EXPLORER WARDROBE 🌿',
    description: 'Handsome, durable, and comfortable heirloom clothing tailored for active baby boys.',
    highlightWord: 'FASHION',
  },
  'organic-linen-outfits': {
    title: 'ORGANIC LINEN OUTFITS',
    badge: 'PRE-WASHED FRENCH FLAX LINEN 🌾',
    description: 'Breathable, pre-washed French flax linen shirts, button-downs, and play shorts for warm sunny days.',
    highlightWord: 'OUTFITS',
  },
  'durable-play-rompers': {
    title: 'DURABLE PLAY ROMPERS',
    badge: 'ACTIVE ADVENTURES 👶',
    description: 'Reinforced flatlock seams and nickel-free snaps built for crawls, play, and smiles.',
    highlightWord: 'ROMPERS',
  },
  'coordinated-sets': {
    title: 'COORDINATED BABY SETS',
    badge: 'EFFORTLESS LUXURY STYLING 🎀',
    description: 'Pre-matched 2-piece and 3-piece sets in harmonized pastel palettes for effortless mornings.',
    highlightWord: 'SETS',
  },
  rompers: {
    title: 'ORGANIC BABY ROMPERS',
    badge: 'HEIRLOOM CRAFTSMANSHIP 🌿',
    description: 'Ultra-soft organic Mongolian cashmere and combed cotton rompers with nickel-free snaps for quick, gentle dressing.',
    highlightWord: 'ROMPERS',
  },
  dresses: {
    title: 'ATELIER BABY DRESSES',
    badge: 'ROYAL PARTY & OCCASIONS 👑',
    description: 'Ethereal party dresses, delicate lace overlays, and French flax linen twirls crafted for milestone celebrations.',
    highlightWord: 'DRESSES',
  },
  bodysuits: {
    title: 'EVERYDAY ORGANIC BODYSUITS',
    badge: 'GOTS CERTIFIED PURE COTTON 🧸',
    description: 'Breathable, stretchy organic cotton onesies with foldover mittens and flatlock anti-chafing seams.',
    highlightWord: 'BODYSUITS',
  },
  sets: {
    title: 'COORDINATED BABY CLOTHING SETS',
    badge: 'EFFORTLESS LUXURY STYLING 🎀',
    description: 'Pre-matched 2-piece and 3-piece sets in harmonized pastel palettes for effortless mornings.',
    highlightWord: 'SETS',
  },
  sleepwear: {
    title: 'CLOUD-SOFT BABY SLEEPWEAR',
    badge: 'SWEET DREAMS COLLECTION ☁️',
    description: 'Temperature-regulating modal and organic cotton sleepsuits for deep, restorative baby sleep.',
    highlightWord: 'SLEEPWEAR',
  },
  'nursery-toys': {
    title: 'SCANDINAVIAN NURSERY & TOYS',
    badge: 'MONTESSORI WOODEN ESSENTIALS 🧸',
    description: 'Handcrafted solid beechwood activity gyms, crochet rattles, and non-toxic heirloom nursery decor.',
    highlightWord: 'NURSERY',
  },
  'bedding-swaddles': {
    title: 'LUXURY BEDDING & SWADDLES',
    badge: 'FRENCH FLAX LINEN COMFORT 🌾',
    description: 'Pre-washed French linen swaddles, organic crib blankets, and silk-soft nursery bedding.',
    highlightWord: 'BEDDING',
  },
  'baby-clothing': {
    title: 'LUXURY BABY CLOTHING',
    badge: 'PREMIUM BOUTIQUE CATALOG 🛍',
    description: 'Handcrafted babywear made with certified organic cashmere, pure linen, and gentle pastel hues.',
    highlightWord: 'CLOTHING',
  },
  'baby-essentials': {
    title: 'NEWBORN & BABY ESSENTIALS',
    badge: 'DAILY ESSENTIALS CATION 🍼',
    description: 'Curated daily essentials for parents and babies, prioritizing safety, comfort, and heirloom durability.',
    highlightWord: 'ESSENTIALS',
  },
};

function CategoryShoppingInner({
  slug,
  customTitle,
  customDescription,
  customBadge,
  parentName = 'Shop',
  parentUrl = '/shop',
  previewData,
  isModalPreview = false,
}: CategoryShoppingTemplateProps) {
  const searchParams = useSearchParams();
  const isPreviewParam = searchParams?.get('preview') === 'true';
  const isPreviewMode = isModalPreview || isPreviewParam || Boolean(previewData);

  const { navigationConfig, products: adminProducts } = useAdminData();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Resolve Category Details from navigationConfig, dictionary or previewData
  const categoryInfo = useMemo(() => {
    // Check dynamic navigation configuration for admin configured categories
    let dynamicMatch: any = null;
    (navigationConfig?.items || []).forEach((item) => {
      if (item.slug === normalizedSlug || item.href.endsWith('/' + normalizedSlug)) {
        dynamicMatch = item;
      }
      (item.subGroups || []).forEach((grp) => {
        if (grp.slug === normalizedSlug || grp.href.endsWith('/' + normalizedSlug)) {
          dynamicMatch = grp;
        }
        (grp.subItems || []).forEach((sub) => {
          if (
            sub.slug === normalizedSlug ||
            sub.href.endsWith('/' + normalizedSlug) ||
            sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedSlug
          ) {
            dynamicMatch = sub;
          }
        });
      });
    });

    // Check built-in dictionary
    const dictMatch = CATEGORY_METADATA[normalizedSlug];

    const fallbackTitle = normalizedSlug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const title =
      previewData?.pageTitle ||
      previewData?.name ||
      customTitle ||
      dynamicMatch?.pageTitle ||
      dynamicMatch?.name ||
      dynamicMatch?.title ||
      dictMatch?.title ||
      `${fallbackTitle.toUpperCase()}`;

    const description =
      previewData?.shortDescription ||
      previewData?.description ||
      customDescription ||
      dynamicMatch?.shortDescription ||
      dynamicMatch?.description ||
      dictMatch?.description ||
      `Explore our luxury ${fallbackTitle} collection, crafted with certified organic materials and timeless European styling.`;

    const detailedDescription =
      previewData?.detailedDescription ||
      dynamicMatch?.detailedDescription;

    const bannerImage = previewData?.bannerImage || dynamicMatch?.bannerImage;
    const thumbnailImage = previewData?.thumbnailImage || dynamicMatch?.thumbnailImage;
    const galleryImages = previewData?.galleryImages || dynamicMatch?.galleryImages || [];
    const assignedProductIds: string[] =
      previewData?.assignedProductIds || dynamicMatch?.assignedProductIds || [];
    const status = previewData?.status || dynamicMatch?.status || 'published';

    const badge =
      previewData?.badge ||
      customBadge ||
      (dynamicMatch?.badge ? `${dynamicMatch.badge} ATELIER ✨` : dictMatch?.badge || 'CURATED BOUTIQUE CATEGORY 🌸');

    return {
      title,
      badge,
      description,
      detailedDescription,
      bannerImage,
      thumbnailImage,
      galleryImages,
      assignedProductIds,
      status,
      highlightWord: dictMatch?.highlightWord || 'COLLECTION',
      subCategories: dictMatch?.subCategories || [
        { name: 'All Items', value: 'all', icon: '✨' },
        { name: 'New Arrivals', value: 'new', icon: '🌸' },
        { name: 'Best Sellers', value: 'bestseller', icon: '🧸' },
      ],
    };
  }, [normalizedSlug, customTitle, customBadge, customDescription, navigationConfig, previewData]);

  // 2. Filter products strictly for this category
  const allAvailableProducts = (adminProducts && adminProducts.length > 0) ? adminProducts : INITIAL_PRODUCTS;

  const filteredProducts = useMemo(() => {
    let baseProducts: Product[] = [];

    // Priority A: If admin assigned specific products to this category
    if (categoryInfo.assignedProductIds && categoryInfo.assignedProductIds.length > 0) {
      baseProducts = allAvailableProducts.filter((product) =>
        categoryInfo.assignedProductIds.includes(product.id)
      );
    }

    // Priority B: If no explicit assigned products, use intelligent keyword/slug matching
    if (baseProducts.length === 0) {
      baseProducts = allAvailableProducts.filter((product) => {
        const pName = product.name.toLowerCase();
        const pCatName = (product.category?.name || '').toLowerCase();
        const pCatSlug = (product.category?.slug || '').toLowerCase();
        const pSlug = (product.slug || '').toLowerCase();
        const pDesc = (product.description || '').toLowerCase();

        // Direct slug match
        const isDirectMatch =
          pCatSlug === normalizedSlug ||
          pCatName === normalizedSlug ||
          pCatName.includes(normalizedSlug) ||
          pName.includes(normalizedSlug) ||
          pSlug.includes(normalizedSlug) ||
          pDesc.includes(normalizedSlug);

        // Subcategory synonyms
        if (normalizedSlug === 'newborn' || normalizedSlug === 'hospital-bag') {
          return (
            isDirectMatch ||
            pCatSlug.includes('baby') ||
            pName.includes('newborn') ||
            pName.includes('onesie') ||
            pName.includes('swaddle')
          );
        }

        if (normalizedSlug === 'party-dresses' || normalizedSlug === 'dresses') {
          return isDirectMatch || pName.includes('dress') || pCatName.includes('dress');
        }

        if (normalizedSlug === 'cashmere-cardigans') {
          return isDirectMatch || pName.includes('cashmere') || pName.includes('cardigan') || pName.includes('knit');
        }

        if (normalizedSlug === 'play-rompers' || normalizedSlug === 'rompers') {
          return isDirectMatch || pName.includes('romper');
        }

        if (normalizedSlug === 'all-girls-fashion') {
          return (
            pCatSlug.includes('girl') ||
            pName.includes('girl') ||
            pName.includes('dress') ||
            pName.includes('skirt') ||
            pName.includes('pink') ||
            pName.includes('aurelia')
          );
        }

        if (normalizedSlug === 'all-boys-fashion') {
          return (
            pCatSlug.includes('boy') ||
            pName.includes('boy') ||
            pName.includes('shirt') ||
            pName.includes('blue') ||
            pName.includes('linen') ||
            pName.includes('adventure')
          );
        }

        if (normalizedSlug === 'organic-linen-outfits') {
          return isDirectMatch || pName.includes('linen') || pDesc.includes('linen');
        }

        if (normalizedSlug === 'coordinated-sets' || normalizedSlug === 'sets') {
          return isDirectMatch || pName.includes('set');
        }

        if (normalizedSlug === 'bodysuits' || normalizedSlug === 'organic-cotton-onesies') {
          return isDirectMatch || pName.includes('onesie') || pName.includes('bodysuit');
        }

        if (normalizedSlug === 'breathable-swaddles') {
          return isDirectMatch || pName.includes('swaddle') || pDesc.includes('swaddle');
        }

        if (normalizedSlug === 'newborn-gift-sets') {
          return isDirectMatch || pName.includes('gift') || pName.includes('gym') || pName.includes('set');
        }

        return isDirectMatch;
      });
    }

    // Sub-filter inside category
    let subFiltered = baseProducts;
    if (activeFilter === 'new') {
      subFiltered = baseProducts.filter((p) => p.isNewArrival);
    } else if (activeFilter === 'bestseller') {
      subFiltered = baseProducts.filter((p) => p.isBestSeller || p.rating >= 4.9);
    } else if (activeFilter !== 'all') {
      subFiltered = baseProducts.filter((p) =>
        p.name.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    // Sort
    const sorted = [...subFiltered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return 0; // default featured
    });

    return sorted;
  }, [allAvailableProducts, normalizedSlug, activeFilter, sortBy, categoryInfo.assignedProductIds]);

  // Handle Draft Protection (Requirement 9: Draft pages are not publicly visible)
  const isDraftOrUnpublished = categoryInfo.status === 'draft' || categoryInfo.status === 'unpublished';
  if (isDraftOrUnpublished && !isPreviewMode) {
    return (
      <>
        {!isModalPreview && <Header />}
        <main className="max-w-3xl mx-auto px-4 py-24 text-center select-none">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-10 sm:p-14 shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
              {categoryInfo.status === 'draft' ? 'Draft Atelier Page' : 'Unpublished Category'}
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-stone-900">
              {categoryInfo.title}
            </h1>
            <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
              This category page is currently being tailored by the boutique admin team and is not yet publicly live.
            </p>
            <div className="pt-4 flex items-center justify-center space-x-3">
              <Link
                href="/shop"
                className="btn-rexbebe-3d btn-3d-pink px-6 py-2.5 text-xs font-bold tracking-wider uppercase inline-flex items-center space-x-1.5"
              >
                <span>Browse Live Collection</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
        {!isModalPreview && <Footer />}
      </>
    );
  }

  // Construct standard breadcrumbs
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: parentName, url: parentUrl },
    { name: categoryInfo.title, url: '#' },
  ];

  return (
    <>
      {!isModalPreview && <Header />}

      {/* Admin Preview Mode Notice Banner */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center space-x-2 shadow-xs border-b border-amber-600/30">
          <Eye className="w-4 h-4 animate-pulse" />
          <span>
            REXBEBE PREVIEW MODE — Status: <strong className="uppercase">{categoryInfo.status}</strong> (Not visible publicly until published)
          </span>
        </div>
      )}

      {/* Hero Category Banner with dynamic uploaded bannerImage & gallery lookbook */}
      <CategoryHeaderBanner
        badge={categoryInfo.badge}
        title={categoryInfo.title}
        highlightWord={categoryInfo.highlightWord}
        description={categoryInfo.description}
        bannerImage={categoryInfo.bannerImage}
        galleryImages={categoryInfo.galleryImages}
        breadcrumbs={breadcrumbItems}
        activeSubCategory={activeFilter}
        subCategories={categoryInfo.subCategories}
        onSelectSubCategory={(val) => setActiveFilter(val)}
        totalProducts={filteredProducts.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Controls Bar: Sorting and Filter Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 mb-6 border-b border-stone-200/80">
          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-600">
            <Filter className="w-4 h-4 text-amber-700" />
            <span>
              Showing <strong className="text-stone-900">{filteredProducts.length}</strong> items in{' '}
              <span className="text-amber-900 uppercase font-bold">{categoryInfo.title}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-stone-500 font-medium flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <span>Sort by:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-2xs"
            >
              <option value="featured">Featured Curations</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Product Grid or Friendly Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Requirement 6 & 16: Friendly empty state without unrelated filler products */
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-700 rounded-full flex items-center justify-center border border-amber-200/60 shadow-xs">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
              No products found in this category yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              We are currently tailoring new luxury additions for the{' '}
              <strong className="text-amber-950 font-bold">{categoryInfo.title}</strong> line.
              Check back shortly or explore our full collection.
            </p>
            <div className="pt-2 flex items-center justify-center space-x-3">
              <Link
                href="/shop"
                className="btn-rexbebe-3d btn-3d-pink px-6 py-2.5 text-xs font-bold tracking-wider uppercase inline-flex items-center space-x-1.5"
              >
                <span>Browse All Products</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Optional Detailed Description if provided */}
        {categoryInfo.detailedDescription && (
          <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-amber-50/50 border border-amber-200/50 max-w-3xl mx-auto text-center space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-800 font-heading">
              ABOUT THIS COLLECTION
            </h4>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
              {categoryInfo.detailedDescription}
            </p>
          </div>
        )}

        {/* Bottom Helpful Navigation Suggestions */}
        <div className="mt-16 pt-8 border-t border-stone-200/80">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-heading font-extrabold tracking-widest uppercase text-stone-500">
              EXPLORE MORE CATEGORIES
            </h4>
            <Link href="/shop" className="text-xs font-bold text-amber-900 hover:underline">
              View All Catalog →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'All Girls Fashion', href: '/girls/all-girls-fashion' },
              { name: 'Party Dresses', href: '/girls/party-dresses' },
              { name: 'Cashmere Cardigans', href: '/girls/cashmere-cardigans' },
              { name: 'Play Rompers', href: '/girls/play-rompers' },
              { name: 'All Boys Fashion', href: '/boys/all-boys-fashion' },
              { name: 'Organic Linen Outfits', href: '/boys/organic-linen-outfits' },
              { name: 'Hospital Bag Essentials', href: '/baby/hospital-bag' },
              { name: 'Organic Cotton Onesies', href: '/baby/organic-cotton-onesies' },
            ].map((cat, i) => (
              <Link
                key={i}
                href={cat.href}
                className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-white text-stone-700 hover:text-amber-900 border border-stone-200/80 text-xs font-semibold transition-all hover:shadow-xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

      </main>

      {!isModalPreview && <Footer />}
    </>
  );
}

export function CategoryShoppingTemplate(props: CategoryShoppingTemplateProps) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-stone-400">Loading collection...</div>}>
      <CategoryShoppingInner {...props} />
    </Suspense>
  );
}
