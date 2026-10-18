'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, FolderTree } from 'lucide-react';
import { NavItemConfig } from '../../types/admin';
import { CategoryTreeNode } from '../../services/categoryService';

interface MoreDropdownMenuProps {
  items: NavItemConfig[];
  categoryTree: CategoryTreeNode[];
  isOpen: boolean;
  onClose: () => void;
}

export function MoreDropdownMenu({
  items,
  categoryTree,
  isOpen,
  onClose,
}: MoreDropdownMenuProps) {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  if (!isOpen || items.length === 0) return null;

  const isTestRecord = (item: { name?: string; slug?: string; id?: string }) => {
    const n = (item.name || '').toUpperCase();
    const s = (item.slug || '').toUpperCase();
    const id = (item.id || '').toUpperCase();
    return (
      n.includes('TEST') ||
      s.includes('TEST') ||
      n.includes('E2E') ||
      s.includes('E2E') ||
      n.includes('INVALID') ||
      s.includes('INVALID') ||
      id.includes('TEST') ||
      id.includes('E2E')
    );
  };

  // Find sub-items / children for the currently hovered overflow category
  const activeHoveredItem = items.find((i) => i.id === hoveredItemId);
  const activeCategoryNode = activeHoveredItem
    ? categoryTree.find(
        (c) =>
          c.id === activeHoveredItem.id ||
          (c.slug && activeHoveredItem.slug && c.slug.toLowerCase() === activeHoveredItem.slug.toLowerCase()) ||
          (c.name && activeHoveredItem.name && c.name.toLowerCase() === activeHoveredItem.name.toLowerCase())
      )
    : null;

  // Filter children to only published, non-draft, non-test
  const activeChildren = (activeCategoryNode?.children || []).filter(
    (c) => c.status !== 'draft' && c.status !== 'unpublished' && !isTestRecord(c)
  );

  // Fallback to legacy subGroups if any
  const legacySubItems = (activeHoveredItem?.subGroups || []).flatMap((g) =>
    (g.subItems || []).filter(
      (s) => s.isActive !== false && s.status !== 'draft' && s.status !== 'unpublished' && !isTestRecord(s)
    )
  );

  const hasSubcategories = activeChildren.length > 0 || legacySubItems.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onMouseLeave={onClose}
        className="absolute top-[calc(100%+8px)] right-0 z-[100] flex flex-row-reverse items-start select-none"
      >
        {/* Main More Panel */}
        <div
          className="w-72 sm:w-80 rounded-[28px] border border-white/10 p-5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] space-y-3 relative text-stone-100 shrink-0"
          style={{ backgroundColor: '#141414' }}
        >
          {/* Header Row */}
          <div className="text-[10px] font-heading font-black tracking-[0.25em] uppercase text-white px-2 pb-2 border-b border-white/10 flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-amber-300">
              <FolderTree className="w-3.5 h-3.5" />
              <span>More Categories</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-bold border border-white/10">
              {items.length} items
            </span>
          </div>

          {/* List of Overflow Categories */}
          <ul className="space-y-1">
            {items.map((item) => {
              const node = categoryTree.find(
                (c) =>
                  c.id === item.id ||
                  (c.slug && item.slug && c.slug.toLowerCase() === item.slug.toLowerCase()) ||
                  (c.name && item.name && c.name.toLowerCase() === item.name.toLowerCase())
              );
              const hasKids = Boolean(
                (node && node.children && node.children.some((c) => c.status !== 'draft' && !isTestRecord(c))) ||
                (item.subGroups && item.subGroups.some((g) => g.subItems && g.subItems.length > 0))
              );
              const isHovered = hoveredItemId === item.id;

              return (
                <li
                  key={item.id}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  className="relative"
                >
                  <Link
                    href={item.href || `/shop/${item.slug}`}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[12px] font-bold tracking-wider uppercase transition-all group ${
                      isHovered
                        ? 'bg-white/15 text-white shadow-xs'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="text-[8px] bg-[#C68A4C] text-white px-1.5 py-0.2 rounded-md font-bold uppercase tracking-widest shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {hasKids && (
                      <ChevronLeft
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isHovered ? 'text-amber-400 -translate-x-0.5' : 'text-stone-500'
                        }`}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Bottom Accent */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">
            <span className="flex items-center space-x-1 text-amber-400 font-extrabold">
              <Sparkles className="w-3 h-3" />
              <span>REXBEBE Boutique</span>
            </span>
            <span className="text-emerald-400 font-bold">100% Curated</span>
          </div>
        </div>

        {/* Nested Flyout Panel to Left (for subcategories of hovered overflow item) */}
        {hasSubcategories && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="w-64 sm:w-72 mr-2 rounded-[28px] border border-white/10 p-5 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] space-y-2 relative text-stone-100 shrink-0"
            style={{ backgroundColor: '#141414' }}
          >
            <div className="text-[10px] font-heading font-black tracking-[0.2em] uppercase text-amber-300 px-2 pb-2 border-b border-white/10 flex items-center justify-between">
              <span className="truncate">{activeHoveredItem?.name}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-bold border border-white/10">
                Subcategories
              </span>
            </div>

            <ul className="space-y-1 max-h-[360px] overflow-y-auto">
              {activeChildren.length > 0
                ? activeChildren.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={child.href || `/shop/${child.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-bold text-stone-300 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <span className="truncate">{child.name}</span>
                        {child.badge && (
                          <span className="text-[8px] bg-[#C68A4C] text-white px-1.5 py-0.2 rounded-md font-bold uppercase shrink-0 ml-1">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))
                : legacySubItems.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={sub.href}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-bold text-stone-300 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <span className="truncate">{sub.name}</span>
                        {sub.badge && (
                          <span className="text-[8px] bg-[#C68A4C] text-white px-1.5 py-0.2 rounded-md font-bold uppercase shrink-0 ml-1">
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
