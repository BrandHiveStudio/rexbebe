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
          <div className="w-[285px] bg-[#e4e0d9]/95 backdrop-blur-2xl rounded-[32px] border border-white/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] space-y-3.5 relative z-10">
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
                    className={`flex items-center justify-between text-[13px] font-extrabold tracking-wider uppercase transition-colors py-1 px-2.5 rounded-xl ${
                      isHovered
                        ? 'text-rose-900 bg-white/40'
                        : item.title === 'SHOP ALL SALE'
                        ? 'text-rose-800 hover:text-rose-950 font-black'
                        : 'text-stone-900 hover:text-rose-900 hover:bg-white/20'
                    }`}
                  >
                    <span>{item.title}</span>
                    {hasSub && (
                      isRightAligned ? (
                        <ChevronLeft
                          className={`w-4 h-4 transition-transform ${
                            isHovered ? 'text-rose-900 -translate-x-1' : 'text-stone-400'
                          }`}
                        />
                      ) : (
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isHovered ? 'text-rose-900 translate-x-1' : 'text-stone-400'
                          }`}
                        />
                      )
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Secondary Flyout Panel - Opens cleanly inside screen */}
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
                <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-rose-900 border-b border-rose-900/15 pb-2 mb-3">
                  {activeHoverItem.title}
                </div>
                {activeHoverItem.subItems.map((sub, i) => (
                  <Link
                    key={i}
                    href={sub.href}
                    onClick={onClose}
                    className="block text-[12px] font-semibold tracking-wide text-stone-800 hover:text-rose-900 hover:bg-white/50 px-3 py-1.5 rounded-lg transition-all"
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
