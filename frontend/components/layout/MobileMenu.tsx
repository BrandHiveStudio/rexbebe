'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Search, ChevronDown, Heart, User, Package, Mail, Sparkles, MapPin, ArrowRight, Moon, Sun } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useTheme } from '../../hooks/useTheme';
import { SHOP_TAXONOMY } from '../header/MegaMenu';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export function MobileMenu({ isOpen, onClose, onOpenSearch }: MobileMenuProps) {
  const [isShopExpanded, setIsShopExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { wishlistCount } = useWishlist();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute left-0 top-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col justify-between border-r border-stone-200 dark:border-slate-800"
          >
            <div>
              {/* Header inside drawer */}
              <div className="p-4 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between bg-stone-50/50 dark:bg-slate-800/50">
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
                  className="p-2 text-stone-400 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-100 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dedicated Search Input on Mobile */}
              <div className="p-4 border-b border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full bg-stone-100 dark:bg-slate-800 text-xs px-3.5 py-2.5 pl-9 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-400 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                  <Search className="w-4 h-4 text-stone-400 dark:text-slate-400 absolute left-3 pointer-events-none" />
                  <button
                    type="submit"
                    className="absolute right-2 px-2 py-1 bg-brand-900 dark:bg-sky-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider"
                  >
                    Go
                  </button>
                </form>
              </div>

              {/* Mobile Main Navigation Links */}
              <div className="p-4 overflow-y-auto max-h-[55vh] space-y-1 text-xs font-semibold tracking-wider uppercase text-stone-800 dark:text-slate-200">
                <Link
                  href="/"
                  onClick={onClose}
                  className="block px-3 py-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-colors"
                >
                  HOME
                </Link>

                {/* SHOP Accordion Item */}
                <div>
                  <button
                    onClick={() => setIsShopExpanded(!isShopExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-colors text-left font-extrabold text-amber-900 dark:text-amber-400"
                  >
                    <span>SHOP</span>
                    <ChevronDown className={`w-4 h-4 text-stone-400 dark:text-slate-400 transition-transform duration-200 ${isShopExpanded ? 'rotate-180 text-brand-600 dark:text-amber-400' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isShopExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-3 space-y-1.5 py-1 border-l-2 border-amber-400 ml-3"
                      >
                        <Link
                          href="/shop"
                          onClick={onClose}
                          className="block px-3 py-1.5 text-[11px] font-bold tracking-wider text-amber-800 dark:text-amber-300 hover:text-amber-950 transition-colors bg-amber-50/60 dark:bg-amber-950/40 rounded-md"
                        >
                          SHOP ALL
                        </Link>

                        {SHOP_TAXONOMY.map((group, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <button
                              onClick={() => toggleSection(group.title)}
                              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-stone-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors text-left"
                            >
                              <span>{group.title}</span>
                              <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${expandedSection === group.title ? 'rotate-180 text-amber-600' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {expandedSection === group.title && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden pl-3 space-y-1 border-l border-stone-200 dark:border-slate-700 ml-2 py-1"
                                >
                                  {group.items.map((sub, i) => (
                                    <Link
                                      key={i}
                                      href={sub.href}
                                      onClick={onClose}
                                      className="block px-2 py-1 text-[10.5px] font-normal tracking-normal text-stone-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/new-in"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-colors"
                >
                  <span>NEW IN</span>
                  <span className="text-[9px] bg-brand-900 dark:bg-sky-500 text-white font-bold px-1.5 py-0.2 rounded">NEW</span>
                </Link>

                <Link
                  href="/girls"
                  onClick={onClose}
                  className="block px-3 py-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-colors"
                >
                  GIRLS
                </Link>

                <Link
                  href="/boys"
                  onClick={onClose}
                  className="block px-3 py-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-colors"
                >
                  BOYS
                </Link>

                <Link
                  href="/baby"
                  onClick={onClose}
                  className="block px-3 py-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-colors"
                >
                  BABY
                </Link>

                <Link
                  href="/collections"
                  onClick={onClose}
                  className="block px-3 py-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-colors"
                >
                  COLLECTIONS
                </Link>

                <Link
                  href="/sale"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition-colors"
                >
                  <span>SALE</span>
                  <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded">UP TO 30%</span>
                </Link>
              </div>
            </div>

            {/* Bottom Quick Customer Action Links & Theme Toggle */}
            <div className="p-4 border-t border-stone-100 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/90 space-y-1.5 text-xs">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-stone-700 dark:text-slate-200 hover:text-brand-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors font-semibold"
              >
                <div className="flex items-center space-x-3">
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-stone-500" />
                  )}
                  <span>THEME</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-200 dark:bg-slate-800 text-stone-800 dark:text-amber-300">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>

              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 text-stone-700 dark:text-slate-300 hover:text-brand-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4 text-stone-500 dark:text-slate-400" />
                <span>MY ACCOUNT</span>
              </Link>

              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 text-stone-700 dark:text-slate-300 hover:text-brand-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>WISHLIST</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account/orders"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 text-stone-700 dark:text-slate-300 hover:text-brand-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <Package className="w-4 h-4 text-stone-500 dark:text-slate-400" />
                <span>TRACK ORDER</span>
              </Link>

              <Link
                href="/contact"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 text-stone-700 dark:text-slate-300 hover:text-brand-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <Mail className="w-4 h-4 text-stone-500 dark:text-slate-400" />
                <span>CONTACT US</span>
              </Link>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

