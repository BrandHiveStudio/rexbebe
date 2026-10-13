'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { MenuItem } from './ShopDropdownMenu';

export const SALE_MENU_TREE: MenuItem[] = [
  {
    title: 'SHOP ALL SALE',
    href: '/sale',
  },
  {
    title: 'BABY GIRLS SALE',
    href: '/sale?gender=girls',
    subItems: [
      { name: 'Dresses', href: '/sale?gender=girls&category=dresses' },
      { name: 'Rompers', href: '/sale?gender=girls&category=rompers' },
      { name: 'Tops', href: '/sale?gender=girls&category=tops' },
      { name: 'Sets', href: '/sale?gender=girls&category=sets' },
      { name: 'Sleepwear', href: '/sale?gender=girls&category=sleepwear' },
    ],
  },
  {
    title: 'BABY BOYS SALE',
    href: '/sale?gender=boys',
    subItems: [
      { name: 'Rompers', href: '/sale?gender=boys&category=rompers' },
      { name: 'T-Shirts', href: '/sale?gender=boys&category=t-shirts' },
      { name: 'Shirts', href: '/sale?gender=boys&category=shirts' },
      { name: 'Shorts', href: '/sale?gender=boys&category=shorts' },
      { name: 'Sets', href: '/sale?gender=boys&category=sets' },
      { name: 'Sleepwear', href: '/sale?gender=boys&category=sleepwear' },
    ],
  },
  {
    title: 'BABY & NEWBORN SALE',
    href: '/sale?category=newborn',
    subItems: [
      { name: 'Newborn Essentials', href: '/sale?category=newborn-essentials' },
      { name: 'Bodysuits', href: '/sale?category=bodysuits' },
      { name: 'Rompers', href: '/sale?category=rompers' },
      { name: 'Baby Sets', href: '/sale?category=baby-sets' },
      { name: 'Accessories', href: '/sale?category=accessories' },
    ],
  },
  {
    title: 'BY DISCOUNT',
    href: '/sale',
    subItems: [
      { name: 'Under 20% Off', href: '/sale?discount=under-20' },
      { name: '20–30% Off', href: '/sale?discount=20-30' },
      { name: '30–50% Off', href: '/sale?discount=30-50' },
      { name: '50%+ Off', href: '/sale?discount=50-plus' },
    ],
  },
  {
    title: 'LAST CHANCE',
    href: '/sale?filter=clearance',
    subItems: [
      { name: 'Final Sizes', href: '/sale?filter=final-sizes' },
      { name: 'Almost Gone', href: '/sale?filter=almost-gone' },
      { name: 'Clearance', href: '/sale?filter=clearance' },
    ],
  },
];

interface SaleDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
}

export function SaleDropdownMenu({ isOpen, onClose, align = 'right' }: SaleDropdownMenuProps) {
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
          <div className="w-[285px] bg-[#FAF8F5]/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-[32px] border border-rose-200/60 dark:border-stone-700/80 p-5 sm:p-6 shadow-[0_20px_60px_-10px_rgba(40,10,10,0.18)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] space-y-2 relative z-10">
            <div className="text-[10px] font-heading font-black tracking-[0.25em] uppercase text-rose-900/70 dark:text-rose-400/80 px-2.5 pb-2 border-b border-rose-200/50 dark:border-stone-800 flex items-center justify-between">
              <span>SPECIAL SALE</span>
              <span className="text-[8px] bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded font-extrabold uppercase">OFFERS</span>
            </div>
            <div className="pt-1 space-y-1">
              {SALE_MENU_TREE.map((item, idx) => {
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
                      className={`flex items-center justify-between text-[12px] xl:text-[13px] font-heading font-extrabold tracking-wider uppercase transition-all duration-150 py-1.5 px-3 rounded-2xl ${
                        isHovered
                          ? 'text-rose-950 dark:text-white bg-white/80 dark:bg-stone-800 shadow-xs'
                          : item.title === 'SHOP ALL SALE'
                          ? 'text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-black hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
                          : 'text-stone-800 dark:text-stone-200 hover:text-rose-900 dark:hover:text-rose-300 hover:bg-white/40 dark:hover:bg-stone-800/40'
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      {hasSub && (
                        isRightAligned ? (
                          <ChevronLeft
                            className={`w-3.5 h-3.5 transition-transform duration-150 shrink-0 mr-1 ${
                              isHovered ? 'text-rose-900 dark:text-rose-400 -translate-x-1' : 'text-stone-400 dark:text-stone-500'
                            }`}
                          />
                        ) : (
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform duration-150 shrink-0 ml-2 ${
                              isHovered ? 'text-rose-900 dark:text-rose-400 translate-x-1' : 'text-stone-400 dark:text-stone-500'
                            }`}
                          />
                        )
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secondary Flyout Panel - Opens cleanly inside screen */}
          <AnimatePresence>
            {activeHoverItem && activeHoverItem.subItems && (
              <motion.div
                initial={{ opacity: 0, x: isRightAligned ? 8 : -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRightAligned ? 8 : -8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className={`${
                  isRightAligned ? 'mr-3' : 'ml-3'
                } w-[260px] bg-[#FAF8F5]/98 dark:bg-stone-900/98 backdrop-blur-2xl rounded-[32px] border border-rose-200/70 dark:border-stone-700/80 p-5 sm:p-6 shadow-[0_20px_60px_-10px_rgba(40,10,10,0.18)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] space-y-2 z-20`}
              >
                <div className="text-[10px] font-heading font-black tracking-[0.25em] uppercase text-rose-900 dark:text-rose-400 border-b border-rose-900/15 dark:border-stone-800 pb-2 mb-2 flex items-center justify-between">
                  <span className="truncate">{activeHoverItem.title}</span>
                  <span className="text-[8px] text-stone-500 uppercase font-bold">{activeHoverItem.subItems.length} items</span>
                </div>
                <div className="space-y-0.5 max-h-[70vh] overflow-y-auto pr-1">
                  {activeHoverItem.subItems.map((sub, i) => (
                    <Link
                      key={i}
                      href={sub.href}
                      onClick={onClose}
                      className="block text-[12px] font-medium tracking-wide text-stone-700 dark:text-stone-300 hover:text-rose-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-stone-800 px-3 py-1.5 rounded-xl transition-all truncate"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
