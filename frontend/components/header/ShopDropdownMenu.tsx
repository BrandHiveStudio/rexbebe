'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export interface SubItem {
  name: string;
  href: string;
}

export interface MenuItem {
  title: string;
  href: string;
  subItems?: SubItem[];
}

export const SHOP_MENU_TREE: MenuItem[] = [
  {
    title: 'SHOP ALL',
    href: '/shop',
  },
  {
    title: 'BY AGE',
    href: '/shop',
    subItems: [
      { name: 'Newborn (0–3M)', href: '/shop?age=0-3m' },
      { name: '3–6 Months', href: '/shop?age=3-6m' },
      { name: '6–12 Months', href: '/shop?age=6-12m' },
      { name: '1–2 Years', href: '/shop?age=1-2y' },
      { name: '2–3 Years', href: '/shop?age=2-3y' },
      { name: '3–4 Years', href: '/shop?age=3-4y' },
      { name: '4–6 Years', href: '/shop?age=4-6y' },
    ],
  },
  {
    title: 'BABY GIRLS',
    href: '/girls',
    subItems: [
      { name: 'Dresses', href: '/girls?category=dresses' },
      { name: 'Rompers', href: '/girls?category=rompers' },
      { name: 'Tops', href: '/girls?category=tops' },
      { name: 'T-Shirts', href: '/girls?category=t-shirts' },
      { name: 'Skirts', href: '/girls?category=skirts' },
      { name: 'Shorts', href: '/girls?category=shorts' },
      { name: 'Leggings', href: '/girls?category=leggings' },
      { name: 'Sets', href: '/girls?category=sets' },
      { name: 'Sleepwear', href: '/girls?category=sleepwear' },
    ],
  },
  {
    title: 'BABY BOYS',
    href: '/boys',
    subItems: [
      { name: 'Rompers', href: '/boys?category=rompers' },
      { name: 'T-Shirts', href: '/boys?category=t-shirts' },
      { name: 'Shirts', href: '/boys?category=shirts' },
      { name: 'Polos', href: '/boys?category=polos' },
      { name: 'Shorts', href: '/boys?category=shorts' },
      { name: 'Trousers', href: '/boys?category=trousers' },
      { name: 'Sets', href: '/boys?category=sets' },
      { name: 'Sleepwear', href: '/boys?category=sleepwear' },
    ],
  },
  {
    title: 'NEWBORN',
    href: '/baby',
    subItems: [
      { name: 'Newborn Essentials', href: '/baby?category=essentials' },
      { name: 'Bodysuits', href: '/baby?category=bodysuits' },
      { name: 'Rompers', href: '/baby?category=rompers' },
      { name: 'Sleepsuits', href: '/baby?category=sleepsuits' },
      { name: 'Swaddles', href: '/baby?category=swaddles' },
      { name: 'Hats & Mittens', href: '/baby?category=hats-mittens' },
      { name: 'Newborn Gift Sets', href: '/baby?category=gift-sets' },
    ],
  },
  {
    title: 'BABY ESSENTIALS',
    href: '/categories/baby-clothing',
    subItems: [
      { name: 'Bodysuits', href: '/categories/bodysuits' },
      { name: 'Bibs', href: '/categories/bibs' },
      { name: 'Swaddles', href: '/categories/swaddles' },
      { name: 'Blankets', href: '/categories/blankets' },
      { name: 'Sleepsuits', href: '/categories/sleepsuits' },
      { name: 'Everyday Essentials', href: '/categories/everyday-essentials' },
    ],
  },
  {
    title: 'SPECIAL OCCASIONS',
    href: '/categories/special-occasions',
    subItems: [
      { name: 'Party Wear', href: '/categories/party-wear' },
      { name: 'Birthday Outfits', href: '/categories/birthday-outfits' },
      { name: 'Festive Wear', href: '/categories/festive-wear' },
      { name: 'Photo Shoot Outfits', href: '/categories/photo-shoot' },
      { name: 'Special Occasion Sets', href: '/categories/special-occasion-sets' },
    ],
  },
  {
    title: 'GIFTING',
    href: '/gifting',
    subItems: [
      { name: 'Baby Gift Sets', href: '/gifting?type=baby-gift-sets' },
      { name: 'Newborn Gifts', href: '/gifting?type=newborn-gifts' },
      { name: 'Baby Shower Gifts', href: '/gifting?type=baby-shower' },
      { name: 'Birthday Gifts', href: '/gifting?type=birthday-gifts' },
      { name: 'Gift Cards', href: '/gifting?type=gift-cards' },
    ],
  },
  {
    title: 'SHOP BY COLLECTION',
    href: '/collections',
    subItems: [
      { name: 'New Arrivals', href: '/new-in' },
      { name: 'Best Sellers', href: '/collections?filter=best-sellers' },
      { name: 'Everyday Collection', href: '/collections?filter=everyday' },
      { name: 'Premium Collection', href: '/collections?filter=premium' },
      { name: 'Sale', href: '/sale' },
    ],
  },
];

interface ShopDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShopDropdownMenu({ isOpen, onClose }: ShopDropdownMenuProps) {
  const [activeHoverItem, setActiveHoverItem] = useState<MenuItem | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onMouseLeave={() => {
            setActiveHoverItem(null);
            onClose();
          }}
          className="absolute top-[calc(100%+8px)] left-0 z-50 flex items-start select-none"
        >
          {/* Main Translucent Soft-Pill Dropdown Box (Matching reference screenshot) */}
          <div className="w-[300px] bg-[#e4e0d9]/92 backdrop-blur-2xl rounded-[32px] border border-white/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-3.5 relative">
            {SHOP_MENU_TREE.map((item, idx) => {
              const hasSub = item.subItems && item.subItems.length > 0;
              const isHovered = activeHoverItem?.title === item.title;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveHoverItem(hasSub ? item : null)}
                  className="relative group"
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between text-[13px] font-extrabold tracking-wider uppercase transition-colors py-1 px-2.5 rounded-xl ${
                      isHovered
                        ? 'text-amber-900 bg-white/40'
                        : 'text-stone-900 hover:text-amber-800 hover:bg-white/20'
                    }`}
                  >
                    <span>{item.title}</span>
                    {hasSub && (
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isHovered ? 'text-amber-900 translate-x-1' : 'text-stone-400'
                        }`}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Sub-item Secondary Glass Flyout Panel */}
          <AnimatePresence>
            {activeHoverItem && activeHoverItem.subItems && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="ml-3 w-[260px] bg-[#e4e0d9]/95 backdrop-blur-2xl rounded-[32px] border border-white/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-2.5"
              >
                <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-900 border-b border-amber-900/15 pb-2 mb-3">
                  {activeHoverItem.title}
                </div>
                {activeHoverItem.subItems.map((sub, i) => (
                  <Link
                    key={i}
                    href={sub.href}
                    onClick={onClose}
                    className="block text-[12px] font-semibold tracking-wide text-stone-800 hover:text-amber-900 hover:bg-white/40 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {sub.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
