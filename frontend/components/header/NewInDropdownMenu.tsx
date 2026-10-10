'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { SubItem, MenuItem } from './ShopDropdownMenu';

export const NEW_IN_MENU_TREE: MenuItem[] = [
  {
    title: 'JUST DROPPED',
    href: '/new-in',
    subItems: [
      { name: 'Newborn', href: '/new-in?category=newborn' },
      { name: 'Baby Girls', href: '/new-in?category=girls' },
      { name: 'Baby Boys', href: '/new-in?category=boys' },
    ],
  },
  {
    title: 'NEW CLOTHING',
    href: '/new-in',
    subItems: [
      { name: 'New Dresses', href: '/new-in?category=dresses' },
      { name: 'New Rompers', href: '/new-in?category=rompers' },
      { name: 'New Tops & T-Shirts', href: '/new-in?category=tops-tshirts' },
      { name: 'New Shirts', href: '/new-in?category=shirts' },
      { name: 'New Sets', href: '/new-in?category=sets' },
      { name: 'New Sleepwear', href: '/new-in?category=sleepwear' },
    ],
  },
  {
    title: 'NEW SEASON',
    href: '/new-in',
    subItems: [
      { name: 'Spring / Summer', href: '/new-in?season=spring-summer' },
      { name: 'Festive', href: '/new-in?season=festive' },
      { name: 'Special Occasion', href: '/new-in?season=special-occasion' },
    ],
  },
  {
    title: 'TRENDING NOW',
    href: '/new-in',
    subItems: [
      { name: 'Best New Sellers', href: '/new-in?trending=best-sellers' },
      { name: 'Most Loved', href: '/new-in?trending=most-loved' },
      { name: 'New Arrivals', href: '/new-in?trending=new-arrivals' },
    ],
  },
];

interface NewInDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewInDropdownMenu({ isOpen, onClose }: NewInDropdownMenuProps) {
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
          {/* Translucent Soft-Pill Dropdown Box */}
          <div className="w-[280px] bg-[#e4e0d9]/92 backdrop-blur-2xl rounded-[32px] border border-white/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-3.5 relative">
            {NEW_IN_MENU_TREE.map((item, idx) => {
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

          {/* Secondary Flyout Panel */}
          <AnimatePresence>
            {activeHoverItem && activeHoverItem.subItems && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="ml-3 w-[240px] bg-[#e4e0d9]/95 backdrop-blur-2xl rounded-[32px] border border-white/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-2.5"
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
