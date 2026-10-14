'use client';

import React, { useState, useMemo } from 'react';
import { Product, ProductVariant } from '../../types/product';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { SizeGuide } from './SizeGuide';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Flame,
  Gift,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Heart,
} from 'lucide-react';
import { WishlistButton } from './WishlistButton';

export function ProductInfo({ product }: { product: Product }) {
  const { addToCart } = useCart();

  // Create or resolve initial variant
  const initialVariant = useMemo<ProductVariant>(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return {
      id: `var-default-${product.id}`,
      sku: product.sku || 'REX-STD',
      price: product.price,
      stockQuantity: product.stockQuantity || 15,
      size: product.sizes?.[0] || 'Standard',
      color: product.colors?.[0]?.name || 'Natural',
      colorHex: product.colors?.[0]?.hex || '#E6DFD5',
    };
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(initialVariant);
  const [selectedSize, setSelectedSize] = useState<string>(
    initialVariant.size || product.sizes?.[0] || 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(() => {
    if (product.colors && product.colors.length > 0) {
      return product.colors[0];
    }
    return {
      name: initialVariant.color || 'Natural',
      hex: initialVariant.colorHex || '#E6DFD5',
    };
  });

  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [registrySaved, setRegistrySaved] = useState(false);
  const [activeSpecTab, setActiveSpecTab] = useState<'fabric' | 'care' | 'details'>('fabric');

  // Available Sizes list
  const availableSizes = useMemo(() => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes;
    }
    const fromVariants = Array.from(
      new Set(product.variants?.map((v) => v.size).filter(Boolean) as string[])
    );
    return fromVariants.length > 0 ? fromVariants : ['Standard'];
  }, [product]);

  // Available Colors list
  const availableColors = useMemo(() => {
    if (product.colors && product.colors.length > 0) {
      return product.colors;
    }
    const map = new Map<string, string>();
    (product.variants || []).forEach((v) => {
      if (v.color && v.colorHex && !map.has(v.color)) {
        map.set(v.color, v.colorHex);
      }
    });
    if (map.size > 0) {
      return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
    }
    return [{ name: 'Natural', hex: '#E6DFD5' }];
  }, [product]);

  // Handle color change
  const handleSelectColor = (col: { name: string; hex: string }) => {
    setSelectedColor(col);
    // Find matching variant if exists
    const matching = (product.variants || []).find(
      (v) => v.color?.toLowerCase() === col.name.toLowerCase() && v.size === selectedSize
    );
    if (matching) {
      setSelectedVariant(matching);
    } else {
      setSelectedVariant((prev) => ({
        ...prev,
        color: col.name,
        colorHex: col.hex,
      }));
    }
  };

  // Handle size change
  const handleSelectSize = (sz: string) => {
    setSelectedSize(sz);
    const matching = (product.variants || []).find(
      (v) => v.size === sz && v.color?.toLowerCase() === selectedColor.name.toLowerCase()
    );
    if (matching) {
      setSelectedVariant(matching);
    } else {
      setSelectedVariant((prev) => ({
        ...prev,
        size: sz,
      }));
    }
  };

  // Stock status calculation
  const currentStock = selectedVariant.stockQuantity ?? product.stockQuantity ?? 15;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= (product.lowStockThreshold || 5);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div>
        {/* Category & Certifications */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-extrabold tracking-widest uppercase text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-100/90 shadow-2xs">
            {product.category?.name || 'Baby Collection'}
          </span>
          {product.subcategory?.name && (
            <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100/80">
              {product.subcategory.name}
            </span>
          )}
          <span className="inline-flex items-center text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
            <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
            {product.brand || 'REXBEBE Atelier'}
          </span>
        </div>

        {/* Product Title */}
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl text-slate-900 font-extrabold tracking-tight mt-1">
          {product.name}
        </h1>

        {/* Price and Discount */}
        <div className="flex items-baseline space-x-3 mt-3">
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatCurrency(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-base sm:text-lg text-slate-400 line-through font-medium">
              {formatCurrency(product.comparePrice)}
            </span>
          )}
          {discountPercent !== null && (
            <span className="bg-pink-100 text-pink-700 text-xs font-extrabold px-2.5 py-1 rounded-full border border-pink-200">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Live Viewing Urgency Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-3 mt-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
          <div className="flex items-center space-x-1.5 font-bold">
            <Eye className="w-4 h-4 text-amber-600 animate-pulse flex-shrink-0" />
            <span>Parents are viewing this right now</span>
          </div>
          <span className="hidden sm:inline text-amber-300">|</span>
          <div className="flex items-center space-x-1.5 font-bold">
            {isOutOfStock ? (
              <span className="text-rose-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-rose-600 flex items-center">
                <Flame className="w-4 h-4 mr-1 text-rose-500 animate-bounce" />
                Only {currentStock} left in stock — order soon!
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                In Stock &amp; Ready to Ship ({currentStock} available)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Short & Full Description */}
      <div className="border-y border-slate-100 py-4 space-y-2">
        {product.shortDescription && (
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            {product.shortDescription}
          </p>
        )}
        <p className="text-stone-600 text-sm font-normal leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Colour Selector */}
      {availableColors.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Colour:{' '}
            <span className="text-slate-900 font-black">{selectedColor.name}</span>
          </label>
          <div className="flex items-center space-x-3">
            {availableColors.map((col, idx) => (
              <button
                key={`${col.name}-${idx}`}
                type="button"
                onClick={() => handleSelectColor(col)}
                className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 flex items-center justify-center ${
                  selectedColor.name === col.name
                    ? 'border-pink-500 ring-2 ring-pink-200 scale-110'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
                title={col.name}
              >
                <span
                  className="w-full h-full rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: col.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Size:{' '}
              <span className="text-slate-900 font-black">{selectedSize}</span>
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs text-pink-700 underline font-bold hover:text-pink-900"
            >
              Size &amp; Fit Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => handleSelectSize(sz)}
                className={`px-4 py-2 text-xs font-extrabold rounded-full border transition-all ${
                  selectedSize === sz
                    ? 'border-pink-500 bg-pink-500 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:border-slate-400 bg-white'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <div className="flex items-center justify-between sm:justify-start border border-slate-200 rounded-full px-3 py-2 bg-slate-50">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-slate-500 hover:text-slate-900 font-extrabold px-2 text-sm disabled:opacity-40"
          >
            -
          </button>
          <span className="text-xs font-black w-8 text-center text-slate-900">{quantity}</span>
          <button
            type="button"
            disabled={isOutOfStock || quantity >= currentStock}
            onClick={() => setQuantity(quantity + 1)}
            className="text-slate-500 hover:text-slate-900 font-extrabold px-2 text-sm disabled:opacity-40"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="primary"
            size="lg"
            disabled={isOutOfStock}
            className={`flex-1 btn-rexbebe-3d text-sm font-black py-3.5 tracking-wider uppercase ${
              isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-300' : ''
            }`}
            onClick={() => addToCart(product, selectedVariant, quantity)}
          >
            {isOutOfStock
              ? 'Out of Stock'
              : `Add to Cart — ${formatCurrency(product.price * quantity)}`}
          </Button>

          <div className="shrink-0">
            <WishlistButton productId={product.id} />
          </div>

          <button
            type="button"
            onClick={() => setRegistrySaved(!registrySaved)}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center flex-shrink-0 ${
              registrySaved
                ? 'bg-pink-100 border-pink-300 text-pink-700'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="Add to Baby Registry"
          >
            <Gift className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Specifications & Product Information Tabs */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSpecTab('fabric')}
            className={`pb-2.5 px-3 text-xs font-extrabold transition-colors border-b-2 ${
              activeSpecTab === 'fabric'
                ? 'border-pink-500 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fabric &amp; Care
          </button>
          <button
            type="button"
            onClick={() => setActiveSpecTab('details')}
            className={`pb-2.5 px-3 text-xs font-extrabold transition-colors border-b-2 ${
              activeSpecTab === 'details'
                ? 'border-pink-500 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveSpecTab('care')}
            className={`pb-2.5 px-3 text-xs font-extrabold transition-colors border-b-2 ${
              activeSpecTab === 'care'
                ? 'border-pink-500 text-pink-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Features &amp; Origin
          </button>
        </div>

        <div className="bg-slate-50/70 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
          {activeSpecTab === 'fabric' && (
            <div className="space-y-2">
              <div>
                <span className="font-extrabold text-slate-900">Material Composition:</span>{' '}
                {product.fabricMaterial || '100% GOTS Certified Organic Cotton'}
              </div>
              <div>
                <span className="font-extrabold text-slate-900">Care Instructions:</span>{' '}
                {product.careInstructions || 'Gentle machine wash cold with baby detergent. Dry flat in shade.'}
              </div>
            </div>
          )}

          {activeSpecTab === 'details' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-extrabold text-slate-900">Product SKU:</span>{' '}
                {product.sku || selectedVariant.sku || 'N/A'}
              </div>
              <div>
                <span className="font-extrabold text-slate-900">Brand:</span>{' '}
                {product.brand || 'REXBEBE Atelier'}
              </div>
              <div>
                <span className="font-extrabold text-slate-900">Gender:</span>{' '}
                {product.gender || 'Baby Unisex'}
              </div>
              <div>
                <span className="font-extrabold text-slate-900">Age Range:</span>{' '}
                {product.ageGroup || 'Newborn – 2 Years'}
              </div>
              {product.weight && (
                <div>
                  <span className="font-extrabold text-slate-900">Item Weight:</span>{' '}
                  {product.weight}
                </div>
              )}
            </div>
          )}

          {activeSpecTab === 'care' && (
            <div className="space-y-2">
              <div>
                <span className="font-extrabold text-slate-900">Country of Origin:</span>{' '}
                {product.countryOfOrigin || 'Sri Lanka & Portugal'}
              </div>
              {product.features && product.features.length > 0 && (
                <div>
                  <span className="font-extrabold text-slate-900 block mb-1">Key Highlights:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {product.features.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Luxury Quality Guarantees */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-600 font-bold">
        <div className="flex flex-col items-center space-y-1 p-2 rounded-2xl bg-purple-50/60 border border-purple-100/60">
          <Truck className="w-4 h-4 text-purple-700" />
          <span>Express Islandwide Delivery</span>
        </div>
        <div className="flex flex-col items-center space-y-1 p-2 rounded-2xl bg-pink-50/60 border border-pink-100/60">
          <ShieldCheck className="w-4 h-4 text-pink-700" />
          <span>GOTS Organic Certified</span>
        </div>
        <div className="flex flex-col items-center space-y-1 p-2 rounded-2xl bg-sky-50/60 border border-sky-100/60">
          <RotateCcw className="w-4 h-4 text-sky-700" />
          <span>30-Day Easy Returns</span>
        </div>
      </div>

      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
