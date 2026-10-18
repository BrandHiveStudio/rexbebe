'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Moon, Sun, ShieldCheck } from 'lucide-react';
import { AnnouncementBar } from '../header/AnnouncementBar';
import { HeaderLogo } from '../header/HeaderLogo';
import { MainNavigation } from '../header/MainNavigation';
import { SearchOverlay } from '../header/SearchOverlay';
import { AccountMenu } from '../header/AccountMenu';
import { WishlistButtonHeader } from '../header/WishlistButtonHeader';
import { CartButtonHeader } from '../header/CartButtonHeader';
import { MobileMenu } from './MobileMenu';
import { CartDrawer } from '../cart/CartDrawer';
import { CurrencySelector } from './CurrencySelector';
import { InternationalGeoBanner } from './InternationalGeoBanner';
import { useTheme } from '../../hooks/useTheme';

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Global Geo-IP International Shipping & Duty Banner */}
      <InternationalGeoBanner />

      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Sticky Header: Soft User Pastel Gradient */}
      <header
        className={`sticky top-0 z-50 bg-user-pastel-header dark:bg-slate-950/90 dark:backdrop-blur-2xl backdrop-blur-xl border-b border-white/60 dark:border-slate-800 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 ${
          hasScrolled ? 'py-1.5 lg:py-2 shadow-slate-900/10' : 'py-3 lg:py-3.5'
        }`}
      >
        <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-4 xl:px-6 relative z-10">
          
          {/* DESKTOP LAYOUT (Top-Left Logo Anchor) */}
          <div
            className={`hidden lg:flex items-center justify-between gap-1 xl:gap-3 2xl:gap-4 transition-all duration-300 ${
              hasScrolled ? 'h-20 lg:h-[84px]' : 'h-24 sm:h-28 lg:h-[114px]'
            }`}
          >
            {/* Top-Left Corner REXBEBE Logo Container */}
            <div className="flex-shrink-0 flex items-center pr-1.5 lg:pr-2.5 xl:pr-5 2xl:pr-7">
              <HeaderLogo imgClassName="w-24 sm:w-28 md:w-36 lg:w-28 xl:w-36 2xl:w-44" />
            </div>

            {/* Desktop Main Navigation */}
            <MainNavigation
              onHoverShop={(hovering) => setIsMegaMenuOpen(hovering)}
              isShopMegaMenuOpen={isMegaMenuOpen}
            />

            {/* Right Side Customer Controls (Matching user screenshot: Currency + Search + Moon Theme Toggle) */}
            <div className="flex-shrink-0 flex items-center space-x-1 lg:space-x-1.5 xl:space-x-2.5 2xl:space-x-3.5 pl-1 xl:pl-3">
              {/* Global Multi-Currency Dropdown */}
              <CurrencySelector />

              {/* Minimalist Search Icon Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 rounded-full flex items-center justify-center text-stone-800 dark:text-stone-200 bg-white/70 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-stone-200/70 dark:border-slate-700 shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
                aria-label="Search items"
                title="Search"
              >
                <Search className="w-4 h-4 xl:w-5 xl:h-5 text-stone-800 dark:text-slate-200 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors stroke-[1.75]" />
              </button>

              {/* Theme Toggle Icon Button (Moon / Sun) */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 rounded-full flex items-center justify-center text-stone-800 dark:text-amber-300 bg-white/70 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-stone-200/70 dark:border-slate-700 shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
                aria-label="Toggle Theme"
                title="Toggle Dark / Light Theme"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-amber-400 transition-colors stroke-[1.75]" />
                ) : (
                  <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-stone-800 group-hover:text-amber-900 transition-colors stroke-[1.75]" />
                )}
              </button>

              {/* Wishlist Icon Badge */}
              <WishlistButtonHeader />

              {/* Account Dropdown */}
              <AccountMenu />

              {/* Direct Quick Link to Admin Dashboard */}
              <Link
                href="/admin"
                className="hidden 2xl:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-[11px] font-heading font-extrabold tracking-wider uppercase transition-all shadow-xs hover:scale-105 active:scale-95 select-none"
                title="Open Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Admin</span>
              </Link>

              {/* Cart Drawer Trigger Badge */}
              <CartButtonHeader />
            </div>

          </div>

          {/* DEDICATED COMPACT MOBILE HEADER LAYOUT */}
          <div className="lg:hidden py-1 space-y-2">
            <div className="flex items-center justify-between gap-1.5">
              {/* Mobile Left: Hamburger Touch Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-pink-600 focus:outline-none bg-white/80 dark:bg-slate-800/80 hover:bg-white rounded-full border border-white/90 dark:border-slate-700 transition-all shadow-xs active:scale-95 flex-shrink-0"
                aria-label="Open Mobile Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Mobile Centered Animated REXBEBE Logo */}
              <div className="flex-1 flex items-center justify-center px-1 overflow-hidden">
                <HeaderLogo imgClassName="w-28 min-[360px]:w-32 min-[400px]:w-36 sm:w-40" />
              </div>

              {/* Mobile Right: Theme Toggle, Wishlist & Cart */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-800 dark:text-amber-300 focus:outline-none bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 rounded-full border border-white/90 dark:border-slate-700 transition-all shadow-xs active:scale-95"
                  aria-label="Toggle Theme"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-700" />
                  )}
                </button>
                <WishlistButtonHeader />
                <CartButtonHeader />
              </div>
            </div>

            {/* Mobile Search Pill Bar */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-center space-x-2.5 px-4 py-2.5 text-slate-800 dark:text-slate-200 bg-white/85 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-white/90 dark:border-slate-700 rounded-full text-xs transition-all shadow-xs min-h-[42px] active:scale-[0.99]"
              aria-label="Open search"
            >
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">Search baby clothes, rompers, toys...</span>
            </button>
          </div>

        </div>
      </header>

      {/* Full Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Slide-out Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Slide-out Mini Cart Drawer */}
      <CartDrawer />
    </>
  );
}
