'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ShopDropdownMenu } from './ShopDropdownMenu';
import { NewInDropdownMenu } from './NewInDropdownMenu';
import { GirlsDropdownMenu } from './GirlsDropdownMenu';
import { BoysDropdownMenu } from './BoysDropdownMenu';
import { NewbornDropdownMenu } from './NewbornDropdownMenu';
import { CollectionsDropdownMenu } from './CollectionsDropdownMenu';
import { SaleDropdownMenu } from './SaleDropdownMenu';

interface MainNavigationProps {
  onHoverShop: (isHovering: boolean) => void;
  isShopMegaMenuOpen: boolean;
}

const NAV_ITEMS = [
  { name: 'HOME', href: '/' },
  { name: 'SHOP', href: '/shop', dropdownType: 'shop' },
  { name: 'NEW IN', href: '/new-in', badge: 'NEW', dropdownType: 'new-in' },
  { name: 'GIRLS', href: '/girls', dropdownType: 'girls' },
  { name: 'BOYS', href: '/boys', dropdownType: 'boys' },
  { name: 'NEWBORN', href: '/baby', dropdownType: 'newborn' },
  { name: 'COLLECTIONS', href: '/collections', dropdownType: 'collections' },
  { name: 'SALE', href: '/sale', badge: 'SALE', dropdownType: 'sale' },
];

export function MainNavigation({ onHoverShop, isShopMegaMenuOpen }: MainNavigationProps) {
  const pathname = usePathname();
  const [isNewInHovered, setIsNewInHovered] = useState(false);
  const [isGirlsHovered, setIsGirlsHovered] = useState(false);
  const [isBoysHovered, setIsBoysHovered] = useState(false);
  const [isNewbornHovered, setIsNewbornHovered] = useState(false);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [isSaleHovered, setIsSaleHovered] = useState(false);

  return (
    <nav className="hidden lg:flex items-center">
      {/* Outer Floating Rounded Capsule Track matching reference screenshot */}
      <div className="bg-[#f0ece5]/90 backdrop-blur-md p-1.5 rounded-full border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] flex items-center space-x-1 xl:space-x-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isDropdownOpen =
            (item.dropdownType === 'shop' && isShopMegaMenuOpen) ||
            (item.dropdownType === 'new-in' && isNewInHovered) ||
            (item.dropdownType === 'girls' && isGirlsHovered) ||
            (item.dropdownType === 'boys' && isBoysHovered) ||
            (item.dropdownType === 'newborn' && isNewbornHovered) ||
            (item.dropdownType === 'collections' && isCollectionsHovered) ||
            (item.dropdownType === 'sale' && isSaleHovered);
          const isHighlighted = isActive || isDropdownOpen;

          return (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => {
                if (item.dropdownType === 'shop') onHoverShop(true);
                if (item.dropdownType === 'new-in') setIsNewInHovered(true);
                if (item.dropdownType === 'girls') setIsGirlsHovered(true);
                if (item.dropdownType === 'boys') setIsBoysHovered(true);
                if (item.dropdownType === 'newborn') setIsNewbornHovered(true);
                if (item.dropdownType === 'collections') setIsCollectionsHovered(true);
                if (item.dropdownType === 'sale') setIsSaleHovered(true);
              }}
              onMouseLeave={() => {
                if (item.dropdownType === 'shop') onHoverShop(false);
                if (item.dropdownType === 'new-in') setIsNewInHovered(false);
                if (item.dropdownType === 'girls') setIsGirlsHovered(false);
                if (item.dropdownType === 'boys') setIsBoysHovered(false);
                if (item.dropdownType === 'newborn') setIsNewbornHovered(false);
                if (item.dropdownType === 'collections') setIsCollectionsHovered(false);
                if (item.dropdownType === 'sale') setIsSaleHovered(false);
              }}
            >
              {/* Floating Badge (e.g. NEW or SALE) */}
              {item.badge && !isHighlighted && (
                <span className="absolute -top-2.5 right-2 z-20 bg-[#C68A4C] text-white text-[8px] font-extrabold tracking-widest uppercase px-1.5 py-0.2 rounded-md shadow-xs pointer-events-none">
                  {item.badge}
                </span>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 xl:px-5 xl:py-2.5 rounded-full transition-all duration-200 text-xs font-heading font-extrabold tracking-wider uppercase select-none ${
                    isHighlighted
                      ? 'bg-[#181818] text-white shadow-md'
                      : 'text-stone-800 hover:text-amber-900 hover:bg-white/60'
                  }`}
                >
                  <span>{item.name}</span>

                  {item.dropdownType && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isHighlighted ? 'text-white rotate-180' : 'text-stone-500'
                      }`}
                    />
                  )}
                </Link>
              </motion.div>

              {/* Render Shop Dropdown Menu */}
              {item.dropdownType === 'shop' && (
                <ShopDropdownMenu
                  isOpen={isShopMegaMenuOpen}
                  onClose={() => onHoverShop(false)}
                />
              )}

              {/* Render New In Dropdown Menu */}
              {item.dropdownType === 'new-in' && (
                <NewInDropdownMenu
                  isOpen={isNewInHovered}
                  onClose={() => setIsNewInHovered(false)}
                />
              )}

              {/* Render Girls Dropdown Menu */}
              {item.dropdownType === 'girls' && (
                <GirlsDropdownMenu
                  isOpen={isGirlsHovered}
                  onClose={() => setIsGirlsHovered(false)}
                />
              )}

              {/* Render Boys Dropdown Menu */}
              {item.dropdownType === 'boys' && (
                <BoysDropdownMenu
                  isOpen={isBoysHovered}
                  onClose={() => setIsBoysHovered(false)}
                />
              )}

              {/* Render Newborn Dropdown Menu */}
              {item.dropdownType === 'newborn' && (
                <NewbornDropdownMenu
                  isOpen={isNewbornHovered}
                  onClose={() => setIsNewbornHovered(false)}
                />
              )}

              {/* Render Collections Dropdown Menu */}
              {item.dropdownType === 'collections' && (
                <CollectionsDropdownMenu
                  isOpen={isCollectionsHovered}
                  onClose={() => setIsCollectionsHovered(false)}
                />
              )}

              {/* Render Sale Dropdown Menu */}
              {item.dropdownType === 'sale' && (
                <SaleDropdownMenu
                  isOpen={isSaleHovered}
                  onClose={() => setIsSaleHovered(false)}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}









