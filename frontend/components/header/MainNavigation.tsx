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
import { DynamicSubMenu } from './DynamicSubMenu';
import { useAdminData } from '../../hooks/AdminContext';

interface MainNavigationProps {
  onHoverShop: (isHovering: boolean) => void;
  isShopMegaMenuOpen: boolean;
}

export function MainNavigation({ onHoverShop, isShopMegaMenuOpen }: MainNavigationProps) {
  const pathname = usePathname();
  const { navigationConfig } = useAdminData();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const [isNewInHovered, setIsNewInHovered] = useState(false);
  const [isGirlsHovered, setIsGirlsHovered] = useState(false);
  const [isBoysHovered, setIsBoysHovered] = useState(false);
  const [isNewbornHovered, setIsNewbornHovered] = useState(false);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [isSaleHovered, setIsSaleHovered] = useState(false);

  const activeNavItems = (navigationConfig?.items || []).filter(item => item.isActive);

  return (
    <nav className="hidden lg:flex items-center min-w-0 flex-shrink">
      {/* Outer Floating Rounded Capsule Track matching reference screenshot */}
      <div className="bg-[#f0ece5]/90 backdrop-blur-md p-1 xl:p-1.5 rounded-full border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] flex items-center space-x-0.5 xl:space-x-1 2xl:space-x-1.5">
        {activeNavItems.map((item) => {
          const isActive = pathname === item.href;
          const isCustomHovered = hoveredItemId === item.id;
          const isDropdownOpen =
            (item.dropdownType === 'shop' && isShopMegaMenuOpen) ||
            (item.dropdownType === 'new-in' && isNewInHovered) ||
            (item.dropdownType === 'girls' && isGirlsHovered) ||
            (item.dropdownType === 'boys' && isBoysHovered) ||
            (item.dropdownType === 'newborn' && isNewbornHovered) ||
            (item.dropdownType === 'collections' && isCollectionsHovered) ||
            (item.dropdownType === 'sale' && isSaleHovered) ||
            (Boolean(item.subGroups && item.subGroups.length > 0) && isCustomHovered);

          const isHighlighted = isActive || isDropdownOpen;
          const hasAnyDropdown = Boolean(
            item.dropdownType || (item.subGroups && item.subGroups.length > 0)
          );

          return (
            <div
              key={item.id || item.name}
              className="relative"
              onMouseEnter={() => {
                setHoveredItemId(item.id);
                if (item.dropdownType === 'shop') onHoverShop(true);
                if (item.dropdownType === 'new-in') setIsNewInHovered(true);
                if (item.dropdownType === 'girls') setIsGirlsHovered(true);
                if (item.dropdownType === 'boys') setIsBoysHovered(true);
                if (item.dropdownType === 'newborn') setIsNewbornHovered(true);
                if (item.dropdownType === 'collections') setIsCollectionsHovered(true);
                if (item.dropdownType === 'sale') setIsSaleHovered(true);
              }}
              onMouseLeave={() => {
                setHoveredItemId(null);
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
                <span className="absolute -top-2 right-1 z-20 bg-[#C68A4C] text-white text-[7px] xl:text-[8px] font-extrabold tracking-widest uppercase px-1 py-0.2 rounded-md shadow-xs pointer-events-none">
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
                  className={`flex items-center space-x-1 xl:space-x-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 2xl:px-4.5 2xl:py-2.5 rounded-full transition-all duration-200 text-[11px] xl:text-xs font-heading font-extrabold tracking-normal xl:tracking-wider uppercase select-none ${
                    isHighlighted
                      ? 'bg-[#181818] text-white shadow-md'
                      : 'text-stone-800 hover:text-amber-900 hover:bg-white/60'
                  }`}
                >
                  <span>{item.name}</span>

                  {hasAnyDropdown && (
                    <ChevronDown
                      className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200 ${
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

              {/* Render Custom Dynamic SubMenu */}
              {(!item.dropdownType || item.subGroups) && item.subGroups && item.subGroups.length > 0 && (
                <DynamicSubMenu
                  isOpen={isCustomHovered}
                  onClose={() => setHoveredItemId(null)}
                  title={item.name}
                  subGroups={item.subGroups}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
