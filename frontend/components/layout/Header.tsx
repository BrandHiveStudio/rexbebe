'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AnnouncementBar } from '../header/AnnouncementBar';
import { HeaderLogo } from '../header/HeaderLogo';
import { MainNavigation } from '../header/MainNavigation';
import { MobileMenu } from './MobileMenu';
import { CartDrawer } from '../cart/CartDrawer';
import { InternationalGeoBanner } from './InternationalGeoBanner';

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* DESKTOP LAYOUT (Logo on Left, Simplified Main Navigation Centered, Optical Balance on Right) */}
          <div
            className={`hidden lg:flex items-center justify-between transition-all duration-300 ${
              hasScrolled ? 'h-20 lg:h-[84px]' : 'h-24 sm:h-28 lg:h-[114px]'
            }`}
          >
            {/* Top-Left Corner REXBEBE Logo Container */}
            <div className="flex-shrink-0 flex items-center pr-4">
              <HeaderLogo imgClassName="w-28 sm:w-32 md:w-36 lg:w-32 xl:w-40 2xl:w-44" />
            </div>

            {/* Desktop Main Navigation (Capsule Layout) */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <MainNavigation
                onHoverShop={(hovering) => setIsMegaMenuOpen(hovering)}
                isShopMegaMenuOpen={isMegaMenuOpen}
              />
            </div>

            {/* Invisible Right Spacer Matching Logo Width to keep Capsule Centered */}
            <div
              className="flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-32 xl:w-40 2xl:w-44 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* DEDICATED COMPACT MOBILE HEADER LAYOUT */}
          <div className="lg:hidden py-1">
            <div className="flex items-center justify-between">
              {/* Mobile Left: Hamburger Touch Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-200 hover:text-amber-900 focus:outline-none bg-white/80 dark:bg-slate-800/80 hover:bg-white rounded-full border border-white/90 dark:border-slate-700 transition-all shadow-xs active:scale-95 flex-shrink-0"
                aria-label="Open Mobile Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Mobile Centered Animated REXBEBE Logo */}
              <div className="flex-1 flex items-center justify-center px-1 overflow-hidden">
                <HeaderLogo imgClassName="w-28 min-[360px]:w-32 min-[400px]:w-36 sm:w-40" />
              </div>

              {/* Balancing Spacer */}
              <div className="w-10 h-10 flex-shrink-0 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

        </div>
      </header>

      {/* Slide-out Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-out Mini Cart Drawer for cart actions */}
      <CartDrawer />
    </>
  );
}
