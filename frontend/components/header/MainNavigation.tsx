'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { DynamicDropdownMenu } from './DynamicDropdownMenu';
import { useAdminData } from '../../hooks/AdminContext';

interface MainNavigationProps {
  onHoverShop?: (isHovering: boolean) => void;
  isShopMegaMenuOpen?: boolean;
}

export function MainNavigation({ onHoverShop }: MainNavigationProps) {
  const pathname = usePathname();
  const { navigationConfig } = useAdminData();
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close any open dropdown on route change
  useEffect(() => {
    setActiveDropdownId(null);
    if (onHoverShop) onHoverShop(false);
  }, [pathname, onHoverShop]);

  // Click outside and Escape key handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownId(null);
        if (onHoverShop) onHoverShop(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdownId(null);
        if (onHoverShop) onHoverShop(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onHoverShop]);

  const activeNavItems = (navigationConfig?.items || [])
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order);

  const handleMouseEnterItem = (itemId: string, hasDropdown: boolean) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    if (hasDropdown) {
      setActiveDropdownId(itemId);
      if (onHoverShop) {
        onHoverShop(itemId === 'nav-shop' || itemId.includes('shop'));
      }
    } else {
      setActiveDropdownId(null);
      if (onHoverShop) onHoverShop(false);
    }
  };

  const handleMouseLeaveItem = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveDropdownId(null);
      if (onHoverShop) onHoverShop(false);
    }, 150);
  };

  const handleItemClick = (e: React.MouseEvent, item: any, hasDropdown: boolean) => {
    // If the category has a destination and user clicks it, allow navigation
    // If on mobile/tablet or click trigger is desired, toggle activeDropdownId
    if (hasDropdown) {
      if (activeDropdownId === item.id) {
        // Already open, allow navigation or close
      } else {
        // Open the dropdown
        setActiveDropdownId(item.id);
      }
    }
  };

  return (
    <nav className="hidden lg:flex items-center min-w-0 flex-shrink" ref={navContainerRef}>
      {/* Outer Floating Rounded Capsule Track matching reference screenshot */}
      <div
        className="bg-[#f0ece5]/90 backdrop-blur-md p-1 xl:p-1.5 rounded-full border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] flex items-center space-x-0.5 xl:space-x-1 2xl:space-x-1.5 relative"
        onMouseLeave={handleMouseLeaveItem}
      >
        {activeNavItems.map((item, index) => {
          const isActive = pathname === item.href;
          const hasDropdown = Boolean(
            (item.subGroups && item.subGroups.length > 0) ||
            ['nav-shop', 'nav-sale', 'nav-girls', 'nav-boys', 'nav-newborn', 'nav-new-in', 'nav-collections'].includes(item.id) ||
            ['SHOP', 'SALE', 'GIRLS', 'BOYS', 'NEWBORN', 'NEW IN', 'COLLECTIONS'].includes(item.name?.toUpperCase())
          );
          const isDropdownOpen = activeDropdownId === item.id;
          const isHighlighted = isActive || isDropdownOpen;

          // Smart alignment: First few items align left; last 3 items align right to prevent viewport overflow
          const totalItems = activeNavItems.length;
          let align: 'left' | 'right' | 'center' = 'left';
          if (index >= totalItems - 3) {
            align = 'right';
          } else if (index >= 2 && index < totalItems - 3) {
            align = 'center';
          }

          return (
            <div
              key={item.id || item.slug || item.name}
              className="relative"
              onMouseEnter={() => handleMouseEnterItem(item.id, hasDropdown)}
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
                  href={item.href || '#'}
                  onClick={(e) => handleItemClick(e, item, hasDropdown)}
                  className={`flex items-center space-x-1 xl:space-x-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 2xl:px-4.5 2xl:py-2.5 rounded-full transition-all duration-200 text-[11px] xl:text-xs font-heading font-extrabold tracking-normal xl:tracking-wider uppercase select-none ${
                    isHighlighted
                      ? 'bg-[#181818] text-white shadow-md'
                      : 'text-stone-800 hover:text-amber-900 hover:bg-white/60'
                  }`}
                  aria-expanded={hasDropdown ? isDropdownOpen : undefined}
                  aria-haspopup={hasDropdown ? 'true' : undefined}
                >
                  <span>{item.name}</span>

                  {hasDropdown && (
                    <ChevronDown
                      className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200 ${
                        isHighlighted ? 'text-white rotate-180' : 'text-stone-500'
                      }`}
                    />
                  )}
                </Link>
              </motion.div>

              {/* Dynamic Single Coherent Dropdown Menu */}
              {hasDropdown && (
                <DynamicDropdownMenu
                  item={item}
                  isOpen={isDropdownOpen}
                  onClose={() => {
                    setActiveDropdownId(null);
                    if (onHoverShop) onHoverShop(false);
                  }}
                  align={align}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
