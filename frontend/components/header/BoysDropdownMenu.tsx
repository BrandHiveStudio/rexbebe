'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export interface BoysCategoryItem {
  name: string;
  href: string;
}

export const BOYS_MENU_ITEMS: BoysCategoryItem[] = [
  { name: 'Rompers', href: '/boys?category=rompers' },
  { name: 'T-Shirts', href: '/boys?category=t-shirts' },
  { name: 'Shirts', href: '/boys?category=shirts' },
  { name: 'Polos', href: '/boys?category=polos' },
  { name: 'Shorts', href: '/boys?category=shorts' },
  { name: 'Trousers', href: '/boys?category=trousers' },
  { name: 'Sets', href: '/boys?category=sets' },
  { name: 'Sleepwear', href: '/boys?category=sleepwear' },
];

interface BoysDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
}

export function BoysDropdownMenu({ isOpen, onClose, align = 'right' }: BoysDropdownMenuProps) {
  const isRightAligned = align === 'right';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onMouseLeave={onClose}
          className={`absolute top-[calc(100%+8px)] ${
            isRightAligned ? 'right-0 left-auto' : 'left-0 right-auto'
          } z-50 flex items-start select-none`}
        >
          <div className="w-[260px] bg-[#e4e0d9]/95 backdrop-blur-2xl rounded-[32px] border border-white/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] space-y-2.5 relative">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-900 border-b border-amber-900/15 pb-2 mb-3">
              BABY BOYS
            </div>
            {BOYS_MENU_ITEMS.map((item, idx) => (
              <div key={idx} className="relative group">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block text-[13px] font-extrabold tracking-wider uppercase text-stone-900 hover:text-amber-900 hover:bg-white/40 px-3 py-1.5 rounded-xl transition-all"
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
