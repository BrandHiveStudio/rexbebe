'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  ShoppingBag,
  Users,
  CreditCard,
  Ticket,
  RotateCcw,
  BarChart3,
  UserCheck,
  Settings,
  ArrowLeft,
  LayoutTemplate,
  Compass,
  Globe2,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAdminData } from '../../hooks/AdminContext';

interface AdminLinkGroup {
  groupTitle: string;
  links: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { visitorStats } = useAdminData();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleOpenNav = () => setIsMobileOpen(true);
    window.addEventListener('open-admin-nav', handleOpenNav);
    return () => window.removeEventListener('open-admin-nav', handleOpenNav);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const NAV_GROUPS: AdminLinkGroup[] = [
    {
      groupTitle: 'STORE MANAGEMENT',
      links: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Inventory', href: '/admin/inventory', icon: Warehouse },
      ],
    },
    {
      groupTitle: 'WEBSITE MANAGEMENT',
      links: [
        { name: 'Categories & Menu', href: '/admin/navigation', icon: FolderTree, badge: 'Header' },
        { name: 'Website Pages', href: '/admin/pages', icon: LayoutTemplate },
        { name: 'Collections', href: '/admin/collections', icon: Compass },
        { name: 'Media Library', href: '/admin/media', icon: Sparkles },
        { name: 'Reviews', href: '/admin/reviews', icon: UserCheck, badge: 'Moderate' },
      ],
    },
    {
      groupTitle: 'PROMOTIONS',
      links: [
        { name: 'Promotions & Sale', href: '/admin/promotions', icon: Ticket, badge: 'Discounts' },
        { name: 'Homepage Studio', href: '/admin/homepage', icon: Sparkles, badge: 'Studio' },
      ],
    },
    {
      groupTitle: 'SETTINGS',
      links: [
        { name: 'Store Details', href: '/admin/settings', icon: Settings },
        { name: 'SEO Settings', href: '/admin/seo', icon: Globe2 },
        { name: 'Admin Users', href: '/admin/users', icon: Users },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#18181B] text-stone-300">
      <div className="overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-none touch-scroll">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800 bg-[#121214] flex items-center justify-between">
          <Link href="/admin" className="block group">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-white font-black text-sm shadow-md">
                🦕
              </div>
              <div>
                <h2 className="font-heading text-lg font-black tracking-wider text-white group-hover:text-amber-400 transition-colors">
                  REXBEBE
                </h2>
                <span className="text-[9px] uppercase tracking-widest text-amber-400/90 font-bold block -mt-0.5">
                  Admin Control Suite
                </span>
              </div>
            </div>
          </Link>
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
              aria-label="Close Admin Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Visitor Status Banner */}
        <div className="mx-4 my-3 p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/20 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-[11px] font-bold text-stone-200">Live Traffic</span>
          </div>
          <Link
            href="/admin/analytics"
            className="text-[10px] font-extrabold text-amber-400 hover:text-amber-300 underline"
          >
            {visitorStats.uniqueVisitors} Visitors ({visitorStats.topCountry})
          </Link>
        </div>

        {/* Nav Link Groups */}
        <nav className="p-3 space-y-5">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">
                {group.groupTitle}
              </div>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                          : 'hover:bg-stone-800/80 hover:text-white text-stone-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                        <span className="tracking-wide">{link.name}</span>
                      </div>
                      {link.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                            isActive
                              ? 'bg-stone-950 text-amber-400'
                              : 'bg-stone-800 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Exit Storefront Button */}
      <div className="p-4 border-t border-stone-800 bg-[#121214]">
        <Link
          href="/"
          className="flex items-center justify-center space-x-2 text-xs font-bold text-stone-300 hover:text-white px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/60 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Exit to Public Storefront</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-68 bg-[#18181B] text-stone-300 min-h-screen flex-col justify-between border-r border-stone-800 flex-shrink-0 select-none shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Trigger (Floating Action Button) */}
      <div className="lg:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-3.5 bg-stone-900 text-white rounded-full shadow-2xl border border-stone-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:outline-none"
          aria-label="Toggle Admin Navigation Drawer"
        >
          <Menu className="w-5 h-5 text-amber-400" />
        </button>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
