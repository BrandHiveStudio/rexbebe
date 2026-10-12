'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import { WishlistButton } from './WishlistButton';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const mainImage = product.images[0]?.url || '/images/products/organic-onesie.jpg';
  const defaultVariant = product.variants[0];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative p-1.5 sm:p-2.5 rounded-2xl bg-gradient-to-br from-pink-100/90 via-purple-100/80 via-sky-100/90 to-amber-100/90 border border-white/90 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.07)] hover:shadow-[0_22px_48px_-6px_rgba(244,114,182,0.25)] transition-all duration-300 h-full flex flex-col"
    >
      {/* 4 Cute Accent Corner Badges */}
      <div className="absolute -top-1.5 -left-1.5 sm:-top-2.5 sm:-left-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-md border border-pink-200 flex items-center justify-center text-[10px] sm:text-xs z-30 transform group-hover:scale-110 transition-transform duration-300 select-none">
        🦋
      </div>
      <div className="absolute -top-1.5 -right-1.5 sm:-top-2.5 sm:-right-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-md border border-purple-200 flex items-center justify-center text-[10px] sm:text-xs z-30 transform group-hover:scale-110 transition-transform duration-300 select-none">
        🌸
      </div>
      <div className="absolute -bottom-1.5 -left-1.5 sm:-bottom-2.5 sm:-left-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-md border border-emerald-200 flex items-center justify-center text-[10px] sm:text-xs z-30 transform group-hover:scale-110 transition-transform duration-300 select-none">
        🧸
      </div>
      <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2.5 sm:-right-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-md border border-amber-200 flex items-center justify-center text-[10px] sm:text-xs z-30 transform group-hover:scale-110 transition-transform duration-300 select-none">
        ✨
      </div>

      {/* Inner Card Container */}
      <div className="w-full h-full bg-white rounded-xl p-2.5 sm:p-4 flex flex-col justify-between overflow-hidden relative border border-slate-100/80 shadow-xs">
        
        {/* Large Product Image Box */}
        <div className="relative w-full aspect-[4/4.8] sm:aspect-[4/4.6] bg-gradient-to-br from-pink-50/80 via-sky-50/50 to-emerald-50/50 rounded-lg overflow-hidden shadow-inner border border-white/90">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
          />

          {/* Floating Cute Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col space-y-1 z-10 pointer-events-none">
            {product.isNewArrival && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-pink-100/90 backdrop-blur-md text-pink-700 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-pink-200/80 shadow-xs">
                ✨ NEW
              </span>
            )}
            {(product.isBestSeller ?? (product.rating >= 4.8)) && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100/90 backdrop-blur-md text-emerald-800 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-emerald-200/80 shadow-xs">
                🌿 BEST SELLER
              </span>
            )}
            {product.comparePrice && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100/90 backdrop-blur-md text-orange-800 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-orange-200/80 shadow-xs">
                🍑 SALE
              </span>
            )}
          </div>

          {/* Wishlist Heart Icon */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            <WishlistButton productId={product.id} />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="pt-4 px-1 pb-1 space-y-2.5 flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-sky-800 bg-sky-50 px-3 py-0.5 rounded-full border border-sky-100/80">
                {product.category.name}
              </span>
              <div className="flex items-center space-x-1 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-100">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-slate-800 text-xs">{product.rating}</span>
              </div>
            </div>

            <Link href={`/products/${product.slug}`} className="block group/title">
              <h3 className="font-heading text-xs sm:text-base md:text-lg font-extrabold text-slate-900 group-hover/title:text-pink-600 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-baseline space-x-1.5 sm:space-x-2">
                <span className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900">
                  {formatCurrency(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                    {formatCurrency(product.comparePrice)}
                  </span>
                )}
              </div>

              {/* Color Swatch Dots */}
              <div className="flex space-x-1 sm:space-x-1.5 items-center">
                {product.variants.map((v) => (
                  v.colorHex && (
                    <span
                      key={v.id}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-200/90 shadow-xs"
                      style={{ backgroundColor: v.colorHex }}
                      title={v.color}
                    />
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Prominent Action Button */}
          <button
            onClick={() => addToCart(product, defaultVariant)}
            className="btn-rexbebe-3d btn-3d-pink w-full mt-2 text-[11px] sm:text-xs md:text-sm font-black tracking-wider uppercase py-2.5 sm:py-3 flex items-center justify-center space-x-1.5 sm:space-x-2 group/btn"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600 group-hover/btn:rotate-12 transition-transform shrink-0" />
            <span className="truncate">ADD TO CART</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}


