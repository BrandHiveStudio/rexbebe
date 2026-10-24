'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { DynamicDropdownMenu } from './DynamicDropdownMenu';
import { MoreDropdownMenu } from './MoreDropdownMenu';
import { useAdminData } from '../../hooks/AdminContext';
import { categoryService, CategoryTreeNode } from '../../services/categoryService';

interface MainNavigationProps {
  onHoverShop?: (isHovering: boolean) => void;
  isShopMegaMenuOpen?: boolean;
}

const isTestRecord = (item: { name?: string; slug?: string; id?: string }) => {
  const id = (item.id || '').toUpperCase();
  return (
    id.startsWith('MOCK-') ||
    id.startsWith('TEST-MOCK-') ||
    id.startsWith('E2E-DUMMY-') ||
    id.includes('CAT-HIVE-TEST')
  );
};

export function MainNavigation({ onHoverShop }: MainNavigationProps) {
  const pathname = usePathname();
  const { navigationConfig } = useAdminData();
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [maxVisibleItems, setMaxVisibleItems] = useState<number>(10);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive item count allowing extended header bar navigation across desktop viewports
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1180) {
        setMaxVisibleItems(8); // lg screens (1024-1179px)
      } else if (width < 1440) {
        setMaxVisibleItems(11); // xl screens (1180-1439px) - fits all 10 core brand items
      } else {
        setMaxVisibleItems(14); // 2xl screens (1440px+)
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch published canonical category tree
  useEffect(() => {
    let mounted = true;
    categoryService
      .getCategoryTree(undefined, true)
      .then((tree) => {
        if (mounted && Array.isArray(tree)) {
          setCategoryTree(tree);
        }
      })
      .catch((err) => console.warn('[MainNavigation] Error loading category tree:', err));
    return () => {
      mounted = false;
    };
  }, []);

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

  const activeNavItems = React.useMemo(() => {
    let items = (navigationConfig?.items || [])
      .filter((item) => {
        if (!item.isActive || item.status === 'draft' || item.status === 'unpublished') {
          return false;
        }
        if (isTestRecord(item)) {
          return false;
        }
        // If dynamic category and categoryTree has loaded, verify it's not a deleted record
        if (categoryTree.length > 0 && item.id.startsWith('cat-')) {
          const inTree = categoryTree.some(
            (c) =>
              c.id === item.id ||
              (c.slug && item.slug && c.slug.toLowerCase() === item.slug.toLowerCase())
          );
          if (!inTree) return false;
        }
        return true;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // 1. HOME as first item
    const homeIndex = items.findIndex(
      (i) => i.id === 'nav-home' || i.href === '/' || i.name?.toUpperCase() === 'HOME'
    );
    let homeItem: any;
    if (homeIndex === -1) {
      homeItem = {
        id: 'nav-home',
        name: 'HOME',
        pageTitle: 'HOME',
        slug: 'home',
        href: '/',
        order: 1,
        status: 'published',
        isActive: true,
        destinationType: 'HOMEPAGE',
      };
    } else {
      [homeItem] = items.splice(homeIndex, 1);
    }

    // 2. ABOUT US immediately after HOME
    const aboutIndex = items.findIndex(
      (i) => i.id === 'nav-about' || i.href === '/about' || i.name?.toUpperCase() === 'ABOUT US'
    );
    let aboutItem: any;
    if (aboutIndex === -1) {
      aboutItem = {
        id: 'nav-about',
        name: 'ABOUT US',
        pageTitle: 'ABOUT US',
        slug: 'about-us',
        href: '/about',
        order: 2,
        status: 'published',
        isActive: true,
        destinationType: 'CUSTOM_PAGE',
      };
    } else {
      [aboutItem] = items.splice(aboutIndex, 1);
    }

    // 3. CONTACT US at the very end of navigation menu
    const contactIndex = items.findIndex(
      (i) => i.id === 'nav-contact' || i.href === '/contact' || i.name?.toUpperCase() === 'CONTACT US'
    );
    let contactItem: any;
    if (contactIndex === -1) {
      contactItem = {
        id: 'nav-contact',
        name: 'CONTACT US',
        pageTitle: 'CONTACT US',
        slug: 'contact-us',
        href: '/contact',
        order: 999,
        status: 'published',
        isActive: true,
        destinationType: 'CUSTOM_PAGE',
      };
    } else {
      [contactItem] = items.splice(contactIndex, 1);
    }

    return [homeItem, aboutItem, ...items, contactItem];
  }, [navigationConfig?.items, categoryTree]);

  // Divide into primary capsule items and overflow "More" items
  const hasOverflow = activeNavItems.length > maxVisibleItems;
  const primaryItems = hasOverflow
    ? activeNavItems.slice(0, maxVisibleItems - 1)
    : activeNavItems;
  const overflowItems = hasOverflow
    ? activeNavItems.slice(maxVisibleItems - 1)
    : [];

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

  const handleMouseEnterMenu = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleMouseLeaveItem = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveDropdownId(null);
      if (onHoverShop) onHoverShop(false);
    }, 280);
  };

  const handleItemClick = (e: React.MouseEvent, item: any, hasDropdown: boolean) => {
    if (hasDropdown) {
      // Touch-friendly toggle: on first tap or touch, open dropdown instead of immediate redirect
      if (activeDropdownId !== item.id) {
        e.preventDefault();
        setActiveDropdownId(item.id);
        if (onHoverShop) {
          onHoverShop(item.id === 'nav-shop' || item.id.includes('shop'));
        }
      }
    }
  };

  const isMoreOpen = activeDropdownId === 'nav-more';

  return (
    <nav className="hidden lg:flex items-center min-w-0 flex-shrink" ref={navContainerRef}>
      {/* Outer Floating Rounded Capsule Track matching reference screenshot */}
      <div
        className="bg-[#f0ece5]/90 backdrop-blur-md p-0.5 xl:p-1 2xl:p-1.5 rounded-full border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] flex items-center space-x-0.5 xl:space-x-1 relative"
        onMouseLeave={handleMouseLeaveItem}
      >
        {primaryItems.map((item, index) => {
          const isActive = pathname === item.href;
          const categoryNode = categoryTree.find(
            (c) =>
              c.id === item.id ||
              (c.slug && item.slug && c.slug.toLowerCase() === item.slug.toLowerCase()) ||
              (c.name && item.name && c.name.toLowerCase() === item.name.toLowerCase()) ||
              (c.slug && item.href && (item.href === `/shop/${c.slug}` || item.href === `/category/${c.slug}`))
          );
          const hasDropdown = Boolean(
            (categoryNode && categoryNode.children && categoryNode.children.length > 0) ||
            (item.subGroups && item.subGroups.length > 0) ||
            ['nav-shop', 'nav-sale', 'nav-girls', 'nav-boys', 'nav-newborn', 'nav-new-in', 'nav-collections'].includes(item.id) ||
            ['SHOP', 'SALE', 'GIRLS', 'BOYS', 'NEWBORN', 'NEW IN', 'COLLECTIONS'].includes(item.name?.toUpperCase())
          );
          const isDropdownOpen = activeDropdownId === item.id;
          const isHighlighted = isActive || isDropdownOpen;

          // Smart alignment: Items in the first half align left (flyouts open right);
          // items in the second half align right (flyouts open left to prevent edge clipping)
          const totalItems = primaryItems.length + (hasOverflow ? 1 : 0);
          const align: 'left' | 'right' = index >= Math.ceil(totalItems / 2) ? 'right' : 'left';

          return (
            <div
              key={item.id || item.slug || item.name}
              className="relative"
              onMouseEnter={() => handleMouseEnterItem(item.id, hasDropdown)}
            >
              {/* Floating Badge (e.g. NEW or SALE) */}
              {item.badge && item.badge.length <= 10 && !isHighlighted && (
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
                  className={`flex items-center space-x-1 xl:space-x-1.5 px-2 py-1 xl:px-2.5 xl:py-1.5 2xl:px-3.5 2xl:py-2 rounded-full transition-all duration-200 text-[10px] xl:text-[11px] 2xl:text-xs font-heading font-extrabold tracking-tight xl:tracking-normal 2xl:tracking-wider uppercase select-none ${
                    isHighlighted
                      ? 'bg-[#181818] text-white shadow-md'
                      : 'text-stone-800 hover:text-amber-900 hover:bg-white/60'
                  }`}
                  aria-expanded={hasDropdown ? isDropdownOpen : undefined}
                  aria-haspopup={hasDropdown ? 'true' : undefined}
                >
                  <span className="whitespace-nowrap">{item.name}</span>

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
                  categoryNode={categoryNode}
                  isOpen={isDropdownOpen}
                  onClose={() => {
                    setActiveDropdownId(null);
                    if (onHoverShop) onHoverShop(false);
                  }}
                  onMouseEnterMenu={handleMouseEnterMenu}
                  onMouseLeaveMenu={handleMouseLeaveItem}
                  align={align}
                />
              )}
            </div>
          );
        })}

        {/* Responsive Overflow "MORE" Button & Dropdown */}
        {hasOverflow && (
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnterItem('nav-more', true)}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <button
                type="button"
                onClick={() =>
                  setActiveDropdownId(activeDropdownId === 'nav-more' ? null : 'nav-more')
                }
                className={`flex items-center space-x-1 xl:space-x-1.5 px-2 py-1 xl:px-2.5 xl:py-1.5 2xl:px-3.5 2xl:py-2 rounded-full transition-all duration-200 text-[10px] xl:text-[11px] 2xl:text-xs font-heading font-extrabold tracking-tight xl:tracking-normal 2xl:tracking-wider uppercase select-none ${
                  isMoreOpen
                    ? 'bg-[#181818] text-white shadow-md'
                    : 'text-stone-800 hover:text-amber-900 hover:bg-white/60'
                }`}
                aria-expanded={isMoreOpen}
                aria-haspopup="true"
              >
                <span>MORE</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                    isMoreOpen
                      ? 'bg-amber-400 text-stone-900'
                      : 'bg-stone-300 text-stone-800'
                  }`}
                >
                  +{overflowItems.length}
                </span>
                <ChevronDown
                  className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-200 ${
                    isMoreOpen ? 'text-white rotate-180' : 'text-stone-500'
                  }`}
                />
              </button>
            </motion.div>

            <MoreDropdownMenu
              items={overflowItems}
              categoryTree={categoryTree}
              isOpen={isMoreOpen}
              onClose={() => {
                setActiveDropdownId(null);
                if (onHoverShop) onHoverShop(false);
              }}
              onMouseEnterMenu={handleMouseEnterMenu}
              onMouseLeaveMenu={handleMouseLeaveItem}
            />
          </div>
        )}
      </div>
    </nav>
  );
}
