'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { SubItem, MenuItem } from './ShopDropdownMenu';

export const COLLECTIONS_MENU_TREE: MenuItem[] = [
  {
    title: 'FEATURED COLLECTIONS',
    href: '/collections',
    subItems: [
      { name: 'New Season', href: '/collections?filter=new-season' },
      { name: 'Best Sellers', href: '/collections?filter=best-sellers' },
      { name: 'Most Loved', href: '/collections?filter=most-loved' },
      { name: 'Limited Edition', href: '/collections?filter=limited-edition' },
    ],
  },
  {
    title: 'BABY ESSENTIALS',
    href: '/collections',
    subItems: [
      { name: 'Newborn Essentials', href: '/collections?category=newborn-essentials' },
      { name: 'Everyday Essentials', href: '/collections?category=everyday-essentials' },
      { name: 'First Wardrobe', href: '/collections?category=first-wardrobe' },
      { name: 'Comfort Collection', href: '/collections?category=comfort' },
    ],
  },
  {
    title: 'BY STYLE',
    href: '/collections',
    subItems: [
      { name: 'Cute & Playful', href: '/collections?style=cute-playful' },
      { name: 'Minimal & Classic', href: '/collections?style=minimal-classic' },
      { name: 'Soft & Cozy', href: '/collections?style=soft-cozy' },
      { name: 'Premium Collection', href: '/collections?style=premium' },
    ],
  },
  {
    title: 'SPECIAL MOMENTS',
    href: '/collections',
    subItems: [
      { name: 'Birthday Collection', href: '/collections?moment=birthday' },
      { name: 'Party Collection', href: '/collections?moment=party' },
      { name: 'Festive Collection', href: '/collections?moment=festive' },
      { name: 'Photoshoot Collection', href: '/collections?moment=photoshoot' },
    ],
  },
  {
    title: 'SEASONAL',
    href: '/collections',
    subItems: [
      { name: 'Summer Collection', href: '/collections?season=summer' },
      { name: 'Winter Collection', href: '/collections?season=winter' },
      { name: 'Holiday Collection', href: '/collections?season=holiday' },
    ],
  },
  {
    title: 'GIFT COLLECTIONS',
    href: '/collections',
    subItems: [
      { name: 'Newborn Gifts', href: '/collections?gift=newborn' },
      { name: 'Baby Shower Gifts', href: '/collections?gift=baby-shower' },
      { name: 'Birthday Gifts', href: '/collections?gift=birthday' },
      { name: 'Gift Sets', href: '/collections?gift=sets' },
    ],
  },
];

interface CollectionsDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
}

export function CollectionsDropdownMenu({ isOpen, onClose, align = 'right' }: CollectionsDropdownMenuProps) {
  const [activeHoverItem, setActiveHoverItem] = useState<MenuItem | null>(null);
  const isRightAligned = align === 'right';

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
          className={`absolute top-[calc(100%+8px)] ${
            isRightAligned ? 'right-0 left-auto flex-row-reverse' : 'left-0 right-auto flex-row'
          } z-50 flex items-start select-none`}
        >
          {/* Main Translucent Soft-Pill Dropdown Box */}
          <div className="w-[290px] bg-[#e4e0d9]/95 backdrop-blur-2xl rounded-[32px] border border-white/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] space-y-3.5 relative z-10">
            {COLLECTIONS_MENU_TREE.map((item, idx) => {
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
                      isRightAligned ? (
                        <ChevronLeft
                          className={`w-4 h-4 transition-transform ${
                            isHovered ? 'text-amber-900 -translate-x-1' : 'text-stone-400'
                          }`}
                        />
                      ) : (
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isHovered ? 'text-amber-900 translate-x-1' : 'text-stone-400'
                          }`}
                        />
                      )
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Secondary Flyout Panel */}
          <AnimatePresence>
            {activeHoverItem && activeHoverItem.subItems && (
              <motion.div
                initial={{ opacity: 0, x: isRightAligned ? 8 : -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRightAligned ? 8 : -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={`${
                  isRightAligned ? 'mr-3' : 'ml-3'
                } w-[250px] bg-[#e4e0d9]/98 backdrop-blur-2xl rounded-[32px] border border-white/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] space-y-2.5 z-20`}
              >
                <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-900 border-b border-amber-900/15 pb-2 mb-3">
                  {activeHoverItem.title}
                </div>
                {activeHoverItem.subItems.map((sub, i) => (
                  <Link
                    key={i}
                    href={sub.href}
                    onClick={onClose}
                    className="block text-[12px] font-semibold tracking-wide text-stone-800 hover:text-amber-900 hover:bg-white/50 px-3 py-1.5 rounded-lg transition-all"
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
