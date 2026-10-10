'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';

export interface SubCategoryOption {
  name: string;
  value: string;
  icon?: string;
}

interface CategoryHeaderBannerProps {
  badge: string;
  title: string;
  highlightWord?: string;
  description: string;
  activeSubCategory?: string;
  subCategories?: SubCategoryOption[];
  onSelectSubCategory?: (value: string) => void;
  totalProducts?: number;
}

export function CategoryHeaderBanner({
  badge,
  title,
  highlightWord,
  description,
  activeSubCategory = 'all',
  subCategories = [],
  onSelectSubCategory,
  totalProducts,
}: CategoryHeaderBannerProps) {
  return (
    <div className="relative overflow-hidden bg-user-pastel-header border-b border-white/60 select-none py-10 sm:py-14 mb-8">
      {/* Background Soft Shader */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-white/40 backdrop-blur-md pointer-events-none" />

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 left-8 text-2xl opacity-60 hidden sm:block"
        >
          🌸
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [5, -5, 5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute top-8 right-12 text-2xl opacity-65 hidden sm:block"
        >
          ✨
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-extrabold">{title}</span>
        </nav>

        {/* Micro Category Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full border border-pink-200/90 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-800 font-heading">
            {badge}
          </span>
        </div>

        {/* Main Title with Pastel Highlight */}
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          {title}{' '}
          {highlightWord && (
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 bg-clip-text text-transparent">
              {highlightWord}
            </span>
          )}
        </h1>

        {/* Description */}
        <p className="text-slate-700 text-xs sm:text-sm font-semibold max-w-xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* Sub-Category Soft 3D Puffy Filter Badges */}
        {subCategories.length > 0 && (
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
            {subCategories.map((sub) => {
              const isActive = activeSubCategory.toLowerCase() === sub.value.toLowerCase();

              return (
                <button
                  key={sub.value}
                  onClick={() => onSelectSubCategory && onSelectSubCategory(sub.value)}
                  className={`
                    btn-rexbebe-3d px-4 py-2 text-xs sm:text-xs font-black tracking-wider uppercase transition-all duration-300 flex items-center space-x-1.5
                    ${isActive ? 'btn-3d-pink scale-105 ring-2 ring-pink-300' : 'btn-3d-sky'}
                  `}
                >
                  {sub.icon && <span>{sub.icon}</span>}
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Total Products Counter */}
        {typeof totalProducts === 'number' && (
          <div className="pt-2 text-[11px] font-extrabold tracking-widest uppercase text-slate-500 font-heading">
            SHOWING {totalProducts} {totalProducts === 1 ? 'ITEM' : 'ITEMS'}
          </div>
        )}

      </div>
    </div>
  );
}
