'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';
import { NavItemConfig } from '../../types/admin';
import { CategoryTreeNode } from '../../services/categoryService';
import { ShopDropdownMenu } from './ShopDropdownMenu';
import { SaleDropdownMenu } from './SaleDropdownMenu';
import { GirlsDropdownMenu } from './GirlsDropdownMenu';
import { BoysDropdownMenu } from './BoysDropdownMenu';
import { NewbornDropdownMenu } from './NewbornDropdownMenu';
import { NewInDropdownMenu } from './NewInDropdownMenu';
import { CollectionsDropdownMenu } from './CollectionsDropdownMenu';

interface DynamicDropdownMenuProps {
  item: NavItemConfig;
  categoryNode?: CategoryTreeNode | null;
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right' | 'center';
}

export function DynamicDropdownMenu({
  item,
  categoryNode,
  isOpen,
  onClose,
  align = 'left',
}: DynamicDropdownMenuProps) {
  const [activeHoverNode, setActiveHoverNode] = useState<CategoryTreeNode | null>(null);

  const isTestRecord = (rec: { name?: string; slug?: string; id?: string }) => {
    const n = (rec.name || '').toUpperCase();
    const s = (rec.slug || '').toUpperCase();
    const id = (rec.id || '').toUpperCase();
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

  const isChildVisible = (c: CategoryTreeNode) => {
    if (!c) return false;
    if (c.status === 'draft' || c.status === 'unpublished') return false;
    if (c.isActive === false) return false;
    if (isTestRecord(c)) return false;
    return true;
  };

  const validChildren = (categoryNode?.children || []).filter(isChildVisible);

  // Set default active hover node when menu opens
  useEffect(() => {
    if (categoryNode && categoryNode.children && categoryNode.children.length > 0) {
      const visible = categoryNode.children.filter(isChildVisible);
      const withChildren = visible.find((c) => c.children && c.children.some(isChildVisible));
      setActiveHoverNode(withChildren || visible[0] || null);
    } else {
      setActiveHoverNode(null);
    }
  }, [categoryNode, isOpen]);

  if (!isOpen) return null;

  const itemId = item.id?.toLowerCase() || '';
  const itemName = item.name?.toUpperCase() || '';
  const itemSlug = item.slug?.toLowerCase() || '';

  // Determine if we have a valid canonical category node with children
  const hasTreeChildren = Boolean(validChildren.length > 0);

  // If no tree node children are available yet, check fallback dedicated menus
  if (!hasTreeChildren) {
    if (itemId === 'nav-shop' || itemName === 'SHOP' || itemSlug === 'shop') {
      return <ShopDropdownMenu isOpen={isOpen} onClose={onClose} />;
    }
    if (itemId === 'nav-sale' || itemName === 'SALE' || itemSlug === 'sale') {
      return <SaleDropdownMenu isOpen={isOpen} onClose={onClose} align={align === 'right' ? 'right' : 'left'} />;
    }
    if (itemId === 'nav-girls' || itemName === 'GIRLS' || itemSlug === 'girls') {
      return <GirlsDropdownMenu isOpen={isOpen} onClose={onClose} align={align === 'right' ? 'right' : 'left'} />;
    }
    if (itemId === 'nav-boys' || itemName === 'BOYS' || itemSlug === 'boys') {
      return <BoysDropdownMenu isOpen={isOpen} onClose={onClose} align={align === 'right' ? 'right' : 'left'} />;
    }
    if (itemId === 'nav-newborn' || itemName === 'NEWBORN' || itemSlug === 'baby' || itemSlug === 'newborn') {
      return <NewbornDropdownMenu isOpen={isOpen} onClose={onClose} align={align === 'right' ? 'right' : 'left'} />;
    }
    if (itemId === 'nav-new-in' || itemName === 'NEW IN' || itemSlug === 'new-in') {
      return <NewInDropdownMenu isOpen={isOpen} onClose={onClose} />;
    }
    if (itemId === 'nav-collections' || itemName === 'COLLECTIONS' || itemSlug === 'collections') {
      return <CollectionsDropdownMenu isOpen={isOpen} onClose={onClose} />;
    }

    // Fallback: If legacy subGroups exist
    const subGroups = (item.subGroups || [])
      .map((g) => ({
        ...g,
        subItems: (g.subItems || []).filter(
          (s) => s.isActive !== false && s.status !== 'draft' && s.status !== 'unpublished' && !isTestRecord(s)
        ),
      }))
      .filter((g) => (g.subItems && g.subItems.length > 0) || g.href);

    if (subGroups.length === 0) return null;

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

    const alignClass =
      align === 'right'
        ? 'right-0 left-auto'
        : align === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'left-0 right-auto';

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute top-[calc(100%+8px)] ${alignClass} z-[100] select-none`}
        >
          <div
            className={`${panelWidthClass} rounded-[28px] border border-white/10 p-5 sm:p-6 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] relative text-stone-100`}
            style={{ backgroundColor: '#141414' }}
            role="menu"
            aria-label={`${item.name} menu`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-xs font-heading font-black tracking-widest uppercase text-white">
                {item.name}
              </span>
              {item.href && item.href !== '#' && (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-300 hover:text-white tracking-wider uppercase transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className={`grid ${gridColsClass}`}>
              {subGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <Link
                      href={group.href || item.href || '/shop'}
                      onClick={onClose}
                      className="text-[12px] font-heading font-black tracking-wider uppercase text-amber-300 hover:text-white transition-colors"
                    >
                      {group.title}
                    </Link>
                  </div>
                  <ul className="space-y-1.5 pt-1">
                    {(group.subItems || []).map((subItem) => (
                      <li key={subItem.id}>
                        <Link
                          href={subItem.href}
                          onClick={onClose}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[12px] sm:text-[13px] font-bold text-stone-300 hover:text-white hover:bg-white/10 transition-all group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform truncate">
                            {subItem.name}
                          </span>
                          {subItem.badge && (
                            <span className="text-[8px] bg-[#C68A4C] text-white px-1.5 py-0.2 rounded-md font-bold uppercase shrink-0 ml-1">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Accent */}
            <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <span className="flex items-center space-x-1 text-amber-400 font-extrabold">
                <Sparkles className="w-3 h-3" />
                <span>REXBEBE Atelier</span>
              </span>
              <span className="text-emerald-400 font-bold">Verified Organic</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // --- CANONICAL RECURSIVE CATEGORY TREE RENDERING ---
  const children = validChildren;
  const isRightAligned = align === 'right';

  const alignClass =
    isRightAligned
      ? 'right-0 left-auto'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0 right-auto';

  // Has flyout child with grandchildren?
  const activeHoverChildren = (activeHoverNode?.children || []).filter(isChildVisible);
  const hasSubChildren = Boolean(activeHoverChildren.length > 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onMouseLeave={onClose}
        className={`absolute top-[calc(100%+8px)] ${alignClass} z-[100] flex items-start select-none ${
          isRightAligned ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Panel 1: Primary Category Children (Level 2) */}
        <div
          className="w-[290px] rounded-[28px] sm:rounded-[32px] border border-white/10 p-5 sm:p-6 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] space-y-2 relative text-stone-100"
          style={{ backgroundColor: '#141414' }}
        >
          {/* Header Row */}
          <div className="text-[10px] font-heading font-black tracking-[0.25em] uppercase text-white px-2 pb-2 border-b border-white/10 flex items-center justify-between">
            <span className="truncate">{categoryNode!.name}</span>
            <Link
              href={categoryNode!.href || `/shop/${categoryNode!.slug}`}
              onClick={onClose}
              className="text-[9px] bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white border border-white/10 px-2 py-0.5 rounded font-extrabold uppercase transition-all"
            >
              View All
            </Link>
          </div>

          {/* Child Category List (Level 2) */}
          <div className="pt-1 space-y-1 max-h-[65vh] overflow-y-auto pr-1">
            {children.map((childNode) => {
              const hasGrandChildren = childNode.children && childNode.children.some(isChildVisible);
              const isHovered = activeHoverNode?.id === childNode.id;

              return (
                <div
                  key={childNode.id}
                  onMouseEnter={() => setActiveHoverNode(childNode)}
                  className="relative group"
                >
                  <Link
                    href={childNode.href || `/shop/${childNode.slug}`}
                    onClick={onClose}
                    className={`flex items-center justify-between text-[12px] xl:text-[13px] font-heading font-extrabold tracking-wider uppercase transition-all duration-150 py-2 px-3 rounded-2xl ${
                      isHovered
                        ? 'text-white bg-white/15 shadow-sm'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">{childNode.name}</span>
                    {hasGrandChildren && (
                      isRightAligned ? (
                        <ChevronLeft
                          className={`w-3.5 h-3.5 transition-transform duration-150 shrink-0 mr-1 ${
                            isHovered
                              ? 'text-amber-400 -translate-x-1'
                              : 'text-stone-400'
                          }`}
                        />
                      ) : (
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform duration-150 shrink-0 ml-2 ${
                            isHovered
                              ? 'text-amber-400 translate-x-1'
                              : 'text-stone-400'
                          }`}
                        />
                      )
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Footer Accent */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            <span className="flex items-center space-x-1 text-amber-400 font-extrabold">
              <Sparkles className="w-3 h-3" />
              <span>REXBEBE Atelier</span>
            </span>
            <span className="text-emerald-400 font-bold">Verified Organic</span>
          </div>
        </div>

        {/* Panel 2: Secondary Flyout Panel for Deeper Nesting (Level 3, Level 4, Unlimited) */}
        <AnimatePresence>
          {hasSubChildren && activeHoverNode && (
            <motion.div
              initial={{ opacity: 0, x: isRightAligned ? 8 : -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRightAligned ? 8 : -8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className={`${
                isRightAligned ? 'mr-3' : 'ml-3'
              } w-[290px] sm:w-[320px] rounded-[28px] sm:rounded-[32px] border border-white/10 p-5 sm:p-6 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] space-y-2 z-[110] text-stone-100`}
              style={{ backgroundColor: '#141414' }}
            >
              {/* Flyout Header */}
              <div className="text-[10px] font-heading font-black tracking-[0.25em] uppercase text-white border-b border-white/10 pb-2 mb-2 flex items-center justify-between">
                <span className="truncate">{activeHoverNode.name}</span>
                <Link
                  href={activeHoverNode.href || `/shop/${activeHoverNode.slug}`}
                  onClick={onClose}
                  className="text-[9px] bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white border border-white/10 px-2 py-0.5 rounded font-extrabold uppercase transition-all shrink-0"
                >
                  View All
                </Link>
              </div>

              {/* Recursive Grandchildren List (Level 3 & Level 4+) */}
              <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-1">
                {activeHoverChildren.map((subChild) => {
                  const grandChildren = (subChild.children || []).filter(isChildVisible);
                  const hasGreatGrandChildren = grandChildren.length > 0;

                  return (
                    <div key={subChild.id} className="space-y-1">
                      {/* Level 3 Link */}
                      <Link
                        href={subChild.href || `/shop/${subChild.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between text-[12px] font-heading font-extrabold tracking-wider uppercase text-stone-200 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all group"
                      >
                        <span className="truncate group-hover:translate-x-1 transition-transform">
                          {subChild.name}
                        </span>
                        {subChild.badge && (
                          <span className="text-[8px] bg-[#C68A4C] text-white px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0 ml-1">
                            {subChild.badge}
                          </span>
                        )}
                      </Link>

                      {/* Level 4+ Recursive Children */}
                      {hasGreatGrandChildren && (
                        <ul className="pl-3.5 border-l-2 border-amber-400/40 ml-2 space-y-1 py-0.5">
                          {grandChildren.map((grandChild) => {
                            const greatGrandChildren = (grandChild.children || []).filter(isChildVisible);
                            return (
                              <li key={grandChild.id}>
                                <Link
                                  href={grandChild.href || `/shop/${grandChild.slug}`}
                                  onClick={onClose}
                                  className="flex items-center justify-between text-[12px] font-bold text-stone-300 hover:text-white hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all group"
                                >
                                  <span className="truncate group-hover:translate-x-1 transition-transform">
                                    • {grandChild.name}
                                  </span>
                                  {grandChild.badge && (
                                    <span className="text-[7px] bg-[#C68A4C] text-white px-1 py-0.2 rounded font-extrabold uppercase shrink-0 ml-1">
                                      {grandChild.badge}
                                    </span>
                                  )}
                                </Link>

                                {/* Level 5+ if present */}
                                {greatGrandChildren.length > 0 && (
                                  <ul className="pl-3 border-l border-white/10 ml-1 mt-0.5 space-y-0.5">
                                    {greatGrandChildren.map((greatGrandChild) => (
                                      <li key={greatGrandChild.id}>
                                        <Link
                                          href={greatGrandChild.href || `/shop/${greatGrandChild.slug}`}
                                          onClick={onClose}
                                          className="block text-[11px] font-semibold text-stone-400 hover:text-white px-2 py-0.5 rounded transition-colors truncate"
                                        >
                                          - {greatGrandChild.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
