'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { NavItemConfig } from '../../types/admin';
import { ShopDropdownMenu } from './ShopDropdownMenu';
import { SaleDropdownMenu } from './SaleDropdownMenu';
import { GirlsDropdownMenu } from './GirlsDropdownMenu';
import { BoysDropdownMenu } from './BoysDropdownMenu';
import { NewbornDropdownMenu } from './NewbornDropdownMenu';
import { NewInDropdownMenu } from './NewInDropdownMenu';
import { CollectionsDropdownMenu } from './CollectionsDropdownMenu';
import { ShopMegaMenu } from './ShopMegaMenu';

interface DynamicDropdownMenuProps {
  item: NavItemConfig;
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right' | 'center';
}

export function DynamicDropdownMenu({
  item,
  isOpen,
  onClose,
  align = 'left',
}: DynamicDropdownMenuProps) {
  if (!isOpen) return null;

  const itemId = item.id?.toLowerCase() || '';
  const itemName = item.name?.toUpperCase() || '';
  const itemSlug = item.slug?.toLowerCase() || '';

  // 1. SHOP dropdown tree matching exact requested hierarchy
  if (itemId === 'nav-shop' || itemName === 'SHOP' || itemSlug === 'shop') {
    return <ShopDropdownMenu isOpen={isOpen} onClose={onClose} />;
  }

  // 2. SALE dropdown tree matching exact requested hierarchy
  if (itemId === 'nav-sale' || itemName === 'SALE' || itemSlug === 'sale') {
    return (
      <SaleDropdownMenu
        isOpen={isOpen}
        onClose={onClose}
        align={align === 'right' ? 'right' : 'left'}
      />
    );
  }

  // 3. Dedicated luxury category dropdowns
  if (itemId === 'nav-girls' || itemName === 'GIRLS' || itemSlug === 'girls') {
    return (
      <GirlsDropdownMenu
        isOpen={isOpen}
        onClose={onClose}
        align={align === 'right' ? 'right' : 'left'}
      />
    );
  }

  if (itemId === 'nav-boys' || itemName === 'BOYS' || itemSlug === 'boys') {
    return (
      <BoysDropdownMenu
        isOpen={isOpen}
        onClose={onClose}
        align={align === 'right' ? 'right' : 'left'}
      />
    );
  }

  if (itemId === 'nav-newborn' || itemName === 'NEWBORN' || itemSlug === 'baby' || itemSlug === 'newborn') {
    return (
      <NewbornDropdownMenu
        isOpen={isOpen}
        onClose={onClose}
        align={align === 'right' ? 'right' : 'left'}
      />
    );
  }

  if (itemId === 'nav-new-in' || itemName === 'NEW IN' || itemSlug === 'new-in') {
    return <NewInDropdownMenu isOpen={isOpen} onClose={onClose} />;
  }

  if (itemId === 'nav-collections' || itemName === 'COLLECTIONS' || itemSlug === 'collections') {
    return <CollectionsDropdownMenu isOpen={isOpen} onClose={onClose} />;
  }

  const subGroups = item.subGroups || [];
  if (subGroups.length === 0) return null;

  // Sizing for standard dropdown menus (e.g. GIRLS, BOYS, NEWBORN with 1-3 columns)
  const groupCount = subGroups.length;
  let panelWidthClass = 'w-[320px]';
  let gridColsClass = 'grid-cols-1';

  if (groupCount === 3) {
    panelWidthClass = 'w-[720px] max-w-[calc(100vw-32px)]';
    gridColsClass = 'grid-cols-3 gap-6';
  } else if (groupCount === 2) {
    panelWidthClass = 'w-[520px] max-w-[calc(100vw-32px)]';
    gridColsClass = 'grid-cols-2 gap-6';
  }

  // Positioning class
  const alignClass =
    align === 'right'
      ? 'right-0 left-auto'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0 right-auto';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute top-[calc(100%+8px)] ${alignClass} z-50 select-none`}
        >
          {/* Main Solid Warm-White / Soft-Cream Dropdown Box */}
          <div
            className={`${panelWidthClass} bg-[#FAF9F5]/98 dark:bg-stone-900/98 backdrop-blur-2xl rounded-[28px] border border-amber-200/70 dark:border-stone-700 p-5 sm:p-6 shadow-[0_20px_60px_-12px_rgba(40,20,10,0.16)] relative text-stone-900 dark:text-stone-100`}
            role="menu"
            aria-label={`${item.name} menu`}
          >
            {/* Top Header Row with Category Title and Quick View All Link */}
            <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-heading font-black tracking-widest uppercase text-stone-900 dark:text-white">
                  {item.name}
                </span>
                {item.description && (
                  <span className="hidden sm:inline-block text-[11px] text-stone-600 dark:text-stone-400 font-medium italic">
                    — {item.description}
                  </span>
                )}
              </div>

              {item.href && item.href !== '#' && (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-900 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 tracking-wider uppercase transition-colors group"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Hierarchical Subgroups Grid */}
            <div className={`grid ${gridColsClass}`}>
              {subGroups.map((group) => {
                const subItems = group.subItems || [];
                return (
                  <div key={group.id} className="space-y-2">
                    {/* Column / Group Title */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/80 dark:border-stone-800">
                      <Link
                        href={group.href || item.href || '/shop'}
                        onClick={onClose}
                        className="text-[12px] font-heading font-black tracking-wider uppercase text-stone-900 dark:text-white hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                      >
                        {group.title}
                      </Link>
                    </div>

                    {/* Subitems List: Clean and spacious */}
                    <ul className="space-y-1.5 pt-1">
                      {subItems.map((subItem) => {
                        const isExternal =
                          subItem.destinationType === 'EXTERNAL_URL' ||
                          subItem.href.startsWith('http');

                        return (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.href}
                              target={isExternal && subItem.openInNewTab ? '_blank' : undefined}
                              rel={isExternal && subItem.openInNewTab ? 'noopener noreferrer' : undefined}
                              onClick={onClose}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12px] sm:text-[13px] font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-950 dark:hover:text-white hover:bg-amber-50/60 dark:hover:bg-stone-800 transition-all duration-150 group"
                            >
                              <span className="group-hover:translate-x-1 group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-transform duration-150 truncate">
                                {subItem.name}
                              </span>

                              {subItem.badge && (
                                <span className="text-[8px] bg-[#C68A4C] text-white px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider shrink-0 ml-1">
                                  {subItem.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Bottom Accent */}
            <div className="mt-4 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              <span className="flex items-center space-x-1 text-amber-800 dark:text-amber-400">
                <Sparkles className="w-3 h-3" />
                <span>Certified Organic Babywear</span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400">Heirloom Quality</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
