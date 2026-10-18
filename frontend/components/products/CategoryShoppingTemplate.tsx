'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
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
import { categoryService, CategoryItem } from '../../services/categoryService';
import { productService } from '../../services/productService';

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
    slug?: string;
    description?: string;
    shortDescription?: string;
    detailedDescription?: string;
    bannerImage?: string;
    thumbnailImage?: string;
    galleryImages?: string[];
    assignedProductIds?: string[];
    shortcutButtons?: any[];
    subCategories?: any[];
    badge?: string;
    status?: string;
  };
  isModalPreview?: boolean;
}

const NEWBORN_SHORTCUT_BUTTONS = [
  { name: 'All Items', value: 'all', icon: '✨' },
  { name: 'Newborn', value: 'newborn', icon: '🌸' },
  { name: 'Dresses', value: 'dresses', icon: '👑' },
  { name: 'Rompers', value: 'rompers', icon: '🌿' },
  { name: 'Sets', value: 'sets', icon: '🎀' },
  { name: 'Sleepwear', value: 'sleepwear', icon: '☁️' },
  { name: 'Toys & Nursery', value: 'toys-nursery', icon: '🧸' },
];

// Curated Category Metadata Dictionary for dynamic matching
const CATEGORY_METADATA: Record<
  string,
  { title: string; badge: string; description: string; highlightWord: string; subCategories?: { name: string; value: string; icon?: string }[] }
> = {
  newborn: {
    title: 'NEWBORN COLLECTION',
    badge: 'COMPLETE BOUTIQUE CATALOG 🛍',
    description: 'Explore our complete line of GOTS certified organic cashmere, French flax linen swaddles, handcrafted wooden toys, and luxury atelier looks.',
    highlightWord: 'COLLECTION',
    subCategories: NEWBORN_SHORTCUT_BUTTONS,
  },
  'newborn-0-3m': {
    title: 'NEWBORN COLLECTION',
    badge: 'COMPLETE BOUTIQUE CATALOG 🛍',
    description: 'Explore our complete line of GOTS certified organic cashmere, French flax linen swaddles, handcrafted wooden toys, and luxury atelier looks.',
    highlightWord: 'COLLECTION',
    subCategories: NEWBORN_SHORTCUT_BUTTONS,
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

  // Canonical Category, Ancestors, Descendants, and Backend Products
  const [canonicalCategory, setCanonicalCategory] = useState<CategoryItem | null>(null);
  const [ancestors, setAncestors] = useState<CategoryItem[]>([]);
  const [descendants, setDescendants] = useState<CategoryItem[]>([]);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;

    // Fetch canonical category by ID or Slug
    categoryService
      .getCategoryById(normalizedSlug)
      .then(async (cat) => {
        if (!mounted || !cat) return;
        setCanonicalCategory(cat);

        // Fetch hierarchical ancestors for breadcrumbs
        try {
          const anc = await categoryService.getCategoryAncestors(cat.id);
          if (mounted && Array.isArray(anc)) setAncestors(anc);
        } catch (e) {
          console.warn('[CategoryShoppingTemplate] Could not load ancestors:', e);
        }

        // Fetch descendants for subcategory shortcuts & descendant product matching
        try {
          const desc = await categoryService.getCategoryDescendants(cat.id);
          if (mounted && Array.isArray(desc)) setDescendants(desc);
        } catch (e) {
          console.warn('[CategoryShoppingTemplate] Could not load descendants:', e);
        }
      })
      .catch((err) => {
        console.warn('[CategoryShoppingTemplate] Canonical category not found via ID/slug API:', err);
      });

    // Fetch products from backend for this category & its descendants
    productService
      .getProducts({ category: normalizedSlug })
      .then((prods) => {
        if (mounted && Array.isArray(prods)) setApiProducts(prods);
      })
      .catch((err) => console.warn('[CategoryShoppingTemplate] Error fetching category products:', err));

    return () => {
      mounted = false;
    };
  }, [normalizedSlug]);

  // 1. Resolve Category Details from navigationConfig, dictionary or previewData
  const categoryInfo = useMemo(() => {
    const isNewbornSlug =
      normalizedSlug === 'newborn' ||
      normalizedSlug === 'newborn-0-3m' ||
      normalizedSlug === 'baby' ||
      normalizedSlug.includes('newborn');

    // Check dynamic navigation configuration for admin configured categories
    let dynamicMatch: any = null;
    (navigationConfig?.items || []).forEach((item) => {
      if (
        item.slug === normalizedSlug ||
        item.href.endsWith('/' + normalizedSlug) ||
        (isNewbornSlug && (item.id === 'nav-newborn' || item.slug === 'newborn'))
      ) {
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
            sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedSlug ||
            (isNewbornSlug && (sub.id === 'sub-newborn' || sub.slug === 'newborn'))
          ) {
            dynamicMatch = sub;
          }
        });
      });
    });

    // Check built-in dictionary
    const dictMatch = CATEGORY_METADATA[normalizedSlug] || (isNewbornSlug ? CATEGORY_METADATA['newborn'] : undefined);

    const fallbackTitle = isNewbornSlug
      ? 'NEWBORN COLLECTION'
      : normalizedSlug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

    const title =
      previewData?.pageTitle ||
      previewData?.name ||
      canonicalCategory?.pageTitle ||
      canonicalCategory?.name ||
      customTitle ||
      dynamicMatch?.pageTitle ||
      dynamicMatch?.name ||
      dynamicMatch?.title ||
      dictMatch?.title ||
      `${fallbackTitle.toUpperCase()}`;

    const description =
      previewData?.shortDescription ||
      previewData?.description ||
      canonicalCategory?.shortDescription ||
      canonicalCategory?.description ||
      customDescription ||
      dynamicMatch?.shortDescription ||
      dynamicMatch?.description ||
      dictMatch?.description ||
      (isNewbornSlug
        ? 'Explore our complete line of GOTS certified organic cashmere, French flax linen swaddles, handcrafted wooden toys, and luxury atelier looks.'
        : `Explore our luxury ${fallbackTitle} collection, crafted with certified organic materials and timeless European styling.`);

    const detailedDescription =
      previewData?.detailedDescription ||
      canonicalCategory?.detailedDescription ||
      dynamicMatch?.detailedDescription;

    const bannerImage = previewData?.bannerImage || canonicalCategory?.bannerImage || dynamicMatch?.bannerImage;
    const thumbnailImage = previewData?.thumbnailImage || canonicalCategory?.thumbnailImage || dynamicMatch?.thumbnailImage;
    const galleryImages = previewData?.galleryImages || canonicalCategory?.galleryImages || dynamicMatch?.galleryImages || [];
    const assignedProductIds: string[] =
      previewData?.assignedProductIds || canonicalCategory?.assignedProductIds || dynamicMatch?.assignedProductIds || (isNewbornSlug ? ['prod-1', 'prod-2', 'prod-3', 'prod-5'] : []);
    const status = previewData?.status || canonicalCategory?.status || dynamicMatch?.status || 'published';
    const isActive = canonicalCategory ? canonicalCategory.isActive : dynamicMatch ? dynamicMatch.isActive !== false : true;

    const badge =
      previewData?.badge ||
      canonicalCategory?.badge ||
      customBadge ||
      (dynamicMatch?.badge
        ? dynamicMatch.badge
        : dictMatch?.badge || (isNewbornSlug ? 'COMPLETE BOUTIQUE CATALOG 🛍' : 'CURATED BOUTIQUE CATEGORY 🌸'));

    // Dynamic child shortcut buttons
    const immediateChildren = descendants.filter((d) => d.parentId === canonicalCategory?.id);
    const dynamicButtons =
      immediateChildren.length > 0
        ? [
            { name: 'All Items', value: 'all', icon: '✨' },
            ...immediateChildren.map((c) => ({
              name: c.name,
              value: c.slug,
              icon: '🌸',
            })),
          ]
        : null;

    const configuredButtons =
      dynamicButtons ||
      previewData?.shortcutButtons?.filter((b: any) => !b.isHidden) ||
      previewData?.subCategories?.filter((b: any) => !b.isHidden) ||
      dynamicMatch?.shortcutButtons?.filter((b: any) => !b.isHidden) ||
      dictMatch?.subCategories;

    const subCategories =
      configuredButtons && configuredButtons.length > 0
        ? configuredButtons
        : isNewbornSlug
        ? NEWBORN_SHORTCUT_BUTTONS
        : [
            { name: 'All Items', value: 'all', icon: '✨' },
            { name: 'New Arrivals', value: 'new', icon: '🌸' },
            { name: 'Best Sellers', value: 'bestseller', icon: '🧸' },
          ];

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
      isActive,
      highlightWord: dictMatch?.highlightWord || (title.toUpperCase().includes('COLLECTION') ? 'COLLECTION' : undefined),
      subCategories,
    };
  }, [normalizedSlug, customTitle, customBadge, customDescription, navigationConfig, previewData, canonicalCategory, descendants]);

  // 2. Filter products strictly for this category and all its descendants
  const allAvailableProducts = useMemo(() => {
    const map = new Map<string, Product>();
    (adminProducts || []).forEach((p) => map.set(p.id, p));
    (apiProducts || []).forEach((p) => map.set(p.id, p));
    if (map.size === 0) {
      INITIAL_PRODUCTS.forEach((p) => map.set(p.id, p));
    }
    return Array.from(map.values());
  }, [adminProducts, apiProducts]);

  const filteredProducts = useMemo(() => {
    // Collect all valid target IDs, slugs, and names for this category + all descendants
    const targetSet = new Set<string>([normalizedSlug]);
    if (canonicalCategory) {
      targetSet.add(canonicalCategory.id.toLowerCase());
      targetSet.add(canonicalCategory.slug.toLowerCase());
      targetSet.add(canonicalCategory.name.toLowerCase());
    }
    descendants.forEach((d) => {
      targetSet.add(d.id.toLowerCase());
      targetSet.add(d.slug.toLowerCase());
      targetSet.add(d.name.toLowerCase());
    });

    const assignedSet = new Set<string>(categoryInfo.assignedProductIds || []);
    if (canonicalCategory?.assignedProductIds) {
      canonicalCategory.assignedProductIds.forEach((pid) => assignedSet.add(pid));
    }
    descendants.forEach((d) => {
      (d.assignedProductIds || []).forEach((pid) => assignedSet.add(pid));
    });

    const isNewbornSlug =
      normalizedSlug === 'newborn' ||
      normalizedSlug === 'newborn-0-3m' ||
      normalizedSlug === 'baby' ||
      normalizedSlug.includes('newborn');

    let baseProducts = allAvailableProducts.filter((product) => {
      if (assignedSet.has(product.id)) return true;

      const pCatId = (product.category?.id || '').toLowerCase();
      const pCatSlug = (product.category?.slug || '').toLowerCase();
      const pCatName = (product.category?.name || '').toLowerCase();
      const pSubId = (product.subcategory?.id || '').toLowerCase();
      const pSubSlug = (product.subcategory?.slug || '').toLowerCase();
      const pSubName = (product.subcategory?.name || '').toLowerCase();

      if (
        (pCatId && targetSet.has(pCatId)) ||
        (pCatSlug && targetSet.has(pCatSlug)) ||
        (pCatName && targetSet.has(pCatName)) ||
        (pSubId && targetSet.has(pSubId)) ||
        (pSubSlug && targetSet.has(pSubSlug)) ||
        (pSubName && targetSet.has(pSubName))
      ) {
        return true;
      }

      // Keyword / description fallback for newborn or hospital bag
      if (isNewbornSlug || normalizedSlug === 'hospital-bag') {
        return (
          pCatSlug.includes('baby') ||
          pCatSlug.includes('toys') ||
          pCatSlug.includes('essentials') ||
          product.name.toLowerCase().includes('newborn') ||
          product.name.toLowerCase().includes('aurelia') ||
          product.name.toLowerCase().includes('play gym') ||
          product.name.toLowerCase().includes('linen') ||
          product.name.toLowerCase().includes('onesie') ||
          product.name.toLowerCase().includes('swaddle') ||
          product.name.toLowerCase().includes('romper') ||
          (product.variants || []).some((v) => (v.size || '').includes('0-3'))
        );
      }

      if (normalizedSlug === 'party-dresses' || normalizedSlug === 'dresses') {
        return pNameIncludes(product, 'dress') || pCatName.includes('dress');
      }

      if (normalizedSlug === 'cashmere-cardigans') {
        return pNameIncludes(product, 'cashmere') || pNameIncludes(product, 'cardigan') || pNameIncludes(product, 'knit');
      }

      if (normalizedSlug === 'play-rompers' || normalizedSlug === 'rompers') {
        return pNameIncludes(product, 'romper');
      }

      if (normalizedSlug === 'all-girls-fashion') {
        return (
          pCatSlug.includes('girl') ||
          pNameIncludes(product, 'girl') ||
          pNameIncludes(product, 'dress') ||
          pNameIncludes(product, 'skirt') ||
          pNameIncludes(product, 'pink')
        );
      }

      if (normalizedSlug === 'all-boys-fashion') {
        return (
          pCatSlug.includes('boy') ||
          pNameIncludes(product, 'boy') ||
          pNameIncludes(product, 'shirt') ||
          pNameIncludes(product, 'blue')
        );
      }

      return false;
    });

    function pNameIncludes(p: Product, term: string) {
      return (
        p.name.toLowerCase().includes(term) ||
        (p.category?.name || '').toLowerCase().includes(term) ||
        (p.category?.slug || '').toLowerCase().includes(term) ||
        (p.subcategory?.name || '').toLowerCase().includes(term)
      );
    }

    // Sub-filter inside category by active shortcut button
    let subFiltered = baseProducts;
    if (activeFilter === 'new') {
      subFiltered = baseProducts.filter((p) => p.isNewArrival);
    } else if (activeFilter === 'bestseller') {
      subFiltered = baseProducts.filter((p) => p.isBestSeller || p.rating >= 4.9);
    } else if (activeFilter !== 'all' && activeFilter !== 'newborn') {
      const af = activeFilter.toLowerCase();
      subFiltered = baseProducts.filter((p) => {
        const pCatId = (p.category?.id || '').toLowerCase();
        const pCatSlug = (p.category?.slug || '').toLowerCase();
        const pCatName = (p.category?.name || '').toLowerCase();
        const pSubId = (p.subcategory?.id || '').toLowerCase();
        const pSubSlug = (p.subcategory?.slug || '').toLowerCase();
        return (
          pCatId === af ||
          pCatSlug === af ||
          pCatName.includes(af) ||
          pSubId === af ||
          pSubSlug === af ||
          p.name.toLowerCase().includes(af)
        );
      });
    }

    // Sort
    const sorted = [...subFiltered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return 0; // default featured
    });

    return sorted;
  }, [allAvailableProducts, normalizedSlug, activeFilter, sortBy, categoryInfo.assignedProductIds, canonicalCategory, descendants]);

  // Handle Draft Protection (Requirement 9: Draft pages are not publicly visible)
  const isDraftOrUnpublished =
    !isPreviewMode &&
    (categoryInfo.status === 'draft' ||
      categoryInfo.status === 'unpublished' ||
      categoryInfo.isActive === false ||
      canonicalCategory?.status === 'draft' ||
      canonicalCategory?.status === 'unpublished' ||
      canonicalCategory?.isActive === false);

  if (isDraftOrUnpublished) {
    return (
      <>
        {!isModalPreview && <Header />}
        <main className="max-w-3xl mx-auto px-4 py-24 text-center select-none">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-10 sm:p-14 shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
              {canonicalCategory?.status === 'draft' || categoryInfo.status === 'draft'
                ? 'Draft Atelier Page'
                : 'Unpublished Category'}
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

  // Construct hierarchical breadcrumbs using ancestors
  const breadcrumbItems = useMemo(() => {
    const items = [{ name: 'Home', url: '/' }];

    if (ancestors && ancestors.length > 0) {
      ancestors.forEach((anc) => {
        items.push({
          name: anc.name,
          url: anc.href || `/shop/${anc.slug}`,
        });
      });
    } else if (parentName && parentName !== 'Home') {
      items.push({ name: parentName, url: parentUrl });
    }

    const currentName =
      canonicalCategory?.name ||
      categoryInfo.title.replace(/\s*COLLECTION\s*/i, '').trim() ||
      categoryInfo.title;

    items.push({
      name: currentName,
      url: canonicalCategory?.href || `/shop/${normalizedSlug}`,
    });

    return items;
  }, [ancestors, canonicalCategory, categoryInfo.title, normalizedSlug, parentName, parentUrl]);

  return (
    <>
      {!isModalPreview && <Header />}

      {/* Admin Preview Mode Notice Banner - Outside content layout, preserving identical design */}
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

      {/* Main Content Area - Identical layout between Admin Preview and Storefront */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Product Grid or Approved Friendly Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Approved friendly empty state when no matching products exist */
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-xs space-y-4 max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 mx-auto bg-pink-50 text-pink-500 rounded-full flex items-center justify-center border border-pink-200/60 shadow-xs">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
              No products available yet.
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              We&apos;re preparing something lovely for this collection. Please check back soon.
            </p>
            <div className="pt-2 flex items-center justify-center space-x-3">
              <Link
                href="/shop"
                className="btn-rexbebe-3d btn-3d-pink px-6 py-2.5 text-xs font-bold tracking-wider uppercase inline-flex items-center space-x-1.5"
              >
                <span>Browse All Boutique Items</span>
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

export { CategoryShoppingTemplate as SharedCategoryPageTemplate };
