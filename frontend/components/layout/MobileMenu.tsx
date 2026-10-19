'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  X,
  Search,
  ChevronDown,
  Heart,
  User,
  Package,
  Mail,
  Sparkles,
  Moon,
  Sun,
  ShieldCheck,
  ShoppingBag,
  Ruler,
  HelpCircle,
  Truck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useTheme } from '../../hooks/useTheme';
import { useAdminData } from '../../hooks/AdminContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export function MobileMenu({ isOpen, onClose, onOpenSearch }: MobileMenuProps) {
  const { navigationConfig } = useAdminData();
  const [expandedNavId, setExpandedNavId] = useState<string | null>(null);
  const [expandedSubGroupId, setExpandedSubGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { wishlistCount } = useWishlist();
  const { isDarkMode, toggleTheme } = useTheme();

  // Lock body scroll and listen for Escape key when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const isTestRecord = (item: { name?: string; slug?: string; id?: string }) => {
    const id = (item.id || '').toUpperCase();
    return (
      id.startsWith('MOCK-') ||
      id.startsWith('TEST-MOCK-') ||
      id.startsWith('E2E-DUMMY-') ||
      id.includes('CAT-HIVE-TEST')
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="absolute left-0 top-0 bottom-0 w-[85%] max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col justify-between border-r border-stone-200 dark:border-slate-800 z-10"
          >
            {/* Header inside drawer */}
            <div className="p-4 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between bg-stone-50/70 dark:bg-slate-800/60 flex-shrink-0">
              <Link href="/" onClick={onClose} aria-label="REXBEBE Home" className="block">
                <Image
                  src="/images/logo.png"
                  alt="REXBEBE"
                  width={240}
                  height={120}
                  className="w-28 sm:w-32 h-auto object-contain dark:brightness-110"
                />
              </Link>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dedicated Search Input */}
            <div className="p-3.5 border-b border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search baby clothes, rompers..."
                  className="w-full bg-stone-100 dark:bg-slate-800 text-xs px-3.5 py-2.5 pl-9 pr-12 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <Search className="w-4 h-4 text-stone-400 dark:text-slate-400 absolute left-3 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-1.5 px-2.5 py-1 bg-purple-950 dark:bg-sky-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Scrollable Dynamic Navigation Area */}
            <div className="flex-1 overflow-y-auto touch-scroll p-4 space-y-1 text-xs font-semibold tracking-wider uppercase text-stone-800 dark:text-slate-200">
              {navigationConfig?.items
                ?.filter((item) => item.isActive !== false && item.status !== 'draft' && item.status !== 'unpublished' && !isTestRecord(item))
                ?.sort((a, b) => a.order - b.order)
                ?.map((item) => {
                  const hasSub = Boolean(item.subGroups && item.subGroups.length > 0);
                  const isExpanded = expandedNavId === item.id;

                  if (!hasSub) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href || '#'}
                        onClick={onClose}
                        className="flex items-center justify-between min-h-[44px] px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-800 transition-colors font-bold"
                      >
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className="text-[9px] bg-[#C68A4C] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 max-w-[120px] truncate ml-2">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        onClick={() => setExpandedNavId(isExpanded ? null : item.id)}
                        className="w-full flex items-center justify-between min-h-[44px] px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-800 transition-colors text-left font-extrabold text-stone-900 dark:text-stone-100"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center space-x-2 min-w-0 pr-2">
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="text-[8px] bg-[#C68A4C] text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 max-w-[100px] truncate">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-stone-400 dark:text-slate-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-amber-700 dark:text-amber-400' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-3 space-y-1.5 py-1 border-l-2 border-amber-300 dark:border-amber-700 ml-3"
                          >
                            {item.href && item.href !== '#' && (
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className="block px-3 py-2 text-[11px] font-bold tracking-wider text-amber-950 dark:text-amber-300 hover:text-amber-700 transition-colors bg-amber-50/70 dark:bg-amber-950/40 rounded-lg min-h-[38px] flex items-center justify-between"
                              >
                                <span>VIEW ALL {item.name}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                              </Link>
                            )}

                            {item.subGroups?.map((group) => {
                              const isGroupExpanded = expandedSubGroupId === group.id;
                              const hasSubItems = Boolean(group.subItems && group.subItems.length > 0);

                              if (!hasSubItems) {
                                return (
                                  <Link
                                    key={group.id}
                                    href={group.href || item.href}
                                    onClick={onClose}
                                    className="block px-3 py-2 text-[11px] font-bold text-stone-800 dark:text-slate-200 hover:text-amber-800 min-h-[38px] flex items-center"
                                  >
                                    {group.title}
                                  </Link>
                                );
                              }

                              return (
                                <div key={group.id} className="space-y-0.5">
                                  <button
                                    onClick={() => setExpandedSubGroupId(isGroupExpanded ? null : group.id)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-stone-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors text-left min-h-[38px]"
                                  >
                                    <span>{group.title}</span>
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                                        isGroupExpanded ? 'rotate-180 text-amber-700' : ''
                                      }`}
                                    />
                                  </button>

                                  <AnimatePresence>
                                    {isGroupExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden pl-3 space-y-1 border-l border-stone-200 dark:border-slate-700 ml-2 py-1"
                                      >
                                        {group.subItems
                                          ?.filter((sub) => sub.isActive !== false && sub.status !== 'draft' && sub.status !== 'unpublished' && !isTestRecord(sub))
                                          ?.map((sub) => (
                                          <Link
                                            key={sub.id}
                                            href={sub.href}
                                            onClick={onClose}
                                            className="block px-2.5 py-1.5 text-[11px] font-medium tracking-normal text-stone-600 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors min-h-[36px] flex items-center justify-between"
                                          >
                                            <span>{sub.name}</span>
                                            {sub.badge && (
                                              <span className="text-[7px] bg-[#C68A4C] text-white px-1 rounded uppercase">
                                                {sub.badge}
                                              </span>
                                            )}
                                          </Link>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

              {/* Informational Customer Guides */}
              <div className="pt-2 border-t border-stone-100 dark:border-slate-800 space-y-0.5 text-[11px] font-normal text-stone-600 dark:text-slate-400">
                <Link
                  href="/size-guide"
                  onClick={onClose}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-slate-800 hover:text-pink-600 min-h-[38px]"
                >
                  <Ruler className="w-3.5 h-3.5 text-pink-500" />
                  <span>Baby Size Guide</span>
                </Link>
                <Link
                  href="/shipping"
                  onClick={onClose}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-slate-800 hover:text-pink-600 min-h-[38px]"
                >
                  <Truck className="w-3.5 h-3.5 text-sky-500" />
                  <span>Delivery &amp; Packaging</span>
                </Link>
                <Link
                  href="/returns"
                  onClick={onClose}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-slate-800 hover:text-pink-600 min-h-[38px]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                  <span>30-Day Returns</span>
                </Link>
                <Link
                  href="/faq"
                  onClick={onClose}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-slate-800 hover:text-pink-600 min-h-[38px]"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                  <span>Frequently Asked Questions</span>
                </Link>
              </div>
            </div>

            {/* Bottom Customer Actions & Theme Toggle */}
            <div className="p-3.5 border-t border-stone-100 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/90 space-y-1 text-xs flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-stone-700 dark:text-slate-200 hover:text-pink-600 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors font-semibold min-h-[40px]"
              >
                <div className="flex items-center space-x-2.5">
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-purple-700" />
                  )}
                  <span>THEME MODE</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-200 dark:bg-slate-800 text-stone-800 dark:text-amber-300">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 text-stone-800 dark:text-slate-200 text-[11px] font-bold min-h-[40px]"
                >
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>Account</span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 text-stone-800 dark:text-slate-200 text-[11px] font-bold min-h-[40px]"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
                  <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}</span>
                </Link>
              </div>

              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-xl font-bold border border-amber-200/70 dark:border-amber-800/70 text-[11px] mt-1 min-h-[38px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Suite</span>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
