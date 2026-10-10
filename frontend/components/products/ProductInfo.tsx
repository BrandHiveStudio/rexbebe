'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types/product';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';
import { useCart } from '../../hooks/useCart';
import { SizeSelector } from './SizeSelector';
import { ColorSelector } from './ColorSelector';
import { SizeGuide } from './SizeGuide';
import { ShieldCheck, Truck, RotateCcw, Heart, Sparkles, Flame, Gift, Eye } from 'lucide-react';

export function ProductInfo({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [registrySaved, setRegistrySaved] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="text-xs font-bold tracking-widest uppercase text-pink-700 bg-pink-100/80 px-2.5 py-0.5 rounded-full">
            {product.category.name}
          </span>
          <span className="inline-flex items-center text-[10px] font-extrabold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
            OEKO-TEX® Standard 100 Certified
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl text-purple-950 font-extrabold tracking-tight mt-1">
          {product.name}
        </h1>

        <div className="flex items-center space-x-3 mt-3">
          <span className="text-2xl font-extrabold text-purple-950">
            {formatCurrency(selectedVariant.price)}
          </span>
          {product.comparePrice && (
            <span className="text-base text-stone-400 line-through font-medium">
              {formatCurrency(product.comparePrice)}
            </span>
          )}
          {product.comparePrice && (
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-md">
              Save {Math.round((1 - selectedVariant.price / product.comparePrice) * 100)}%
            </span>
          )}
        </div>

        {/* Live Viewing Urgency Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-3 mt-3 p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
          <div className="flex items-center space-x-1.5 font-bold">
            <Eye className="w-4 h-4 text-amber-600 animate-pulse flex-shrink-0" />
            <span>16 parents looking at this right now</span>
          </div>
          <span className="hidden sm:inline text-amber-300">|</span>
          <div className="flex items-center space-x-1 font-bold text-rose-700">
            <Flame className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Only {selectedVariant.stockQuantity || 4} left in size {selectedVariant.size || 'Default'}!</span>
          </div>
        </div>
      </div>

      <p className="text-stone-600 text-sm font-normal leading-relaxed border-y border-stone-100 py-4">
        {product.description}
      </p>

      {/* Selectors */}
      <div className="space-y-5">
        <ColorSelector
          variants={product.variants}
          selectedVariant={selectedVariant}
          onSelect={setSelectedVariant}
        />

        <div className="flex items-center justify-between">
          <SizeSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariant}
          />
          <button
            onClick={() => setIsSizeGuideOpen(true)}
            className="text-xs text-pink-700 underline font-bold hover:text-pink-900"
          >
            Size &amp; Fit Guide
          </button>
        </div>
      </div>

      {/* Quantity & Add to Cart */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <div className="flex items-center justify-between sm:justify-start border border-stone-200 rounded-full px-3 py-2 bg-stone-50">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-stone-500 hover:text-stone-900 font-bold px-2 text-sm"
          >
            -
          </button>
          <span className="text-xs font-extrabold w-8 text-center text-purple-950">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="text-stone-500 hover:text-stone-900 font-bold px-2 text-sm"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="primary"
            size="lg"
            className="flex-1 btn-rexbebe-3d text-sm font-bold py-3.5"
            onClick={() => addToCart(product, selectedVariant, quantity)}
          >
            Add to Cart — {formatCurrency(selectedVariant.price * quantity)}
          </Button>

          <button
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

      {/* Luxury Quality Guarantees */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-100 text-center text-[11px] text-stone-600 font-medium">
        <div className="flex flex-col items-center space-y-1 p-2 rounded-2xl bg-purple-50/50">
          <Truck className="w-4 h-4 text-purple-700" />
          <span>Express Global Shipping</span>
        </div>
        <div className="flex flex-col items-center space-y-1 p-2 rounded-2xl bg-pink-50/50">
          <ShieldCheck className="w-4 h-4 text-pink-700" />
          <span>GOTS Organic Cotton</span>
        </div>
        <div className="flex flex-col items-center space-y-1 p-2 rounded-2xl bg-sky-50/50">
          <RotateCcw className="w-4 h-4 text-sky-700" />
          <span>30-Day Easy Returns</span>
        </div>
      </div>

      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
