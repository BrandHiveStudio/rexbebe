'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Compass,
  ShoppingBag,
  Warehouse,
  UserCheck,
  Ticket,
  Image as ImageIcon,
  Settings,
  Globe2,
  Sparkles,
  Plus,
  ExternalLink,
  ArrowRight,
  Star,
  CheckCircle2,
  TrendingUp,
  Tag,
  Eye,
  Heart,
} from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { useAdminData } from '../../hooks/AdminContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminDashboardPage() {
  const { products, navigationConfig, visitorLogs, visitorStats } = useAdminData();

  const bestSellerProducts = products.filter((p) => p.isBestSeller);
  const activeNavItems = navigationConfig?.items?.filter((i) => i.isActive) || [];
  const inStockCount = products.reduce((acc, p) => {
    const total = p.variants?.reduce((vSum, v) => vSum + (v.stockQuantity || 0), 0) || 0;
    return acc + total;
  }, 0);

  // 12 Clearly Labelled Navigation Cards (Section 1)
  const DASHBOARD_CARDS = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View a summary of your store.',
      href: '/admin',
      icon: LayoutDashboard,
      badge: 'Active View',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      countText: 'Live Summary',
    },
    {
      id: 'products',
      title: 'Products',
      description: 'Add and manage baby clothes.',
      href: '/admin/products',
      icon: Package,
      badge: `${products.length} Outfits`,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      countText: `${products.length} Products Available`,
    },
    {
      id: 'categories',
      title: 'Categories & Menu',
      description: 'Manage header categories and submenu items.',
      href: '/admin/navigation',
      icon: FolderTree,
      badge: `${activeNavItems.length} Categories`,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      countText: 'Header Menus & Subcategories',
    },
    {
      id: 'pages',
      title: 'Website Pages',
      description: 'Manage page titles, descriptions and images.',
      href: '/admin/pages',
      icon: FileText,
      badge: '6 Pages',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      countText: 'About, Shipping, FAQ & More',
    },
    {
      id: 'collections',
      title: 'Collections',
      description: 'Create and manage product collections.',
      href: '/admin/collections',
      icon: Compass,
      badge: 'Curated Sets',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      countText: 'Everyday Essentials & Festive',
    },
    {
      id: 'orders',
      title: 'Orders',
      description: 'View and manage customer orders.',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: 'Ready to Pack',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      countText: 'Customer Purchases & Status',
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Manage available stock.',
      href: '/admin/inventory',
      icon: Warehouse,
      badge: `${inStockCount} In Stock`,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      countText: 'Stock Levels & Availability',
    },
    {
      id: 'reviews',
      title: 'Reviews',
      description: 'Review customer feedback.',
      href: '/admin/reviews',
      icon: UserCheck,
      badge: '5★ Rated',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      countText: 'Parent Love & Feedback',
    },
    {
      id: 'promotions',
      title: 'Promotions & Sale',
      description: 'Manage discounts and sale products.',
      href: '/admin/promotions',
      icon: Ticket,
      badge: 'Special Offers',
      color: 'bg-pink-50 text-pink-700 border-pink-200',
      countText: 'Discounts & New Arrivals',
    },
    {
      id: 'media',
      title: 'Media Library',
      description: 'Find and reuse uploaded images.',
      href: '/admin/media',
      icon: ImageIcon,
      badge: 'Photo Storage',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      countText: 'Banners, Cards & Catalog Photos',
    },
    {
      id: 'settings',
      title: 'Store Settings',
      description: 'Manage relevant store information.',
      href: '/admin/settings',
      icon: Settings,
      badge: 'Store Info',
      color: 'bg-stone-100 text-stone-700 border-stone-200',
      countText: 'Contact, Address & Shipping Rules',
    },
    {
      id: 'seo',
      title: 'SEO Settings',
      description: 'Manage search engine information.',
      href: '/admin/seo',
      icon: Globe2,
      badge: 'Google Preview',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      countText: 'Google Search & Social Shares',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="REXBEBE Store Admin"
          subtitle="Simple, non-technical control center for your baby clothing boutique"
          actions={
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md shadow-amber-900/10 transition-all hover:scale-105 active:scale-95"
            >
              <span>View Customer Website</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Link>
          }
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Message Card (Section 1) */}
          <div className="bg-gradient-to-br from-amber-100/70 via-rose-50/60 to-white p-6 sm:p-8 rounded-3xl border border-amber-200/70 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/80 text-amber-800 text-xs font-bold border border-amber-200/80 shadow-2xs">
                  <span>🌸 Handcrafted Baby Boutique</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 tracking-tight">
                  Welcome to REXBEBE Admin!
                </h1>
                <p className="text-sm sm:text-base text-stone-600 font-medium max-w-2xl">
                  Manage your little store easily. Choose what you want to do below.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/admin/products"
                  className="px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add a Baby Outfit</span>
                </Link>
                <Link
                  href="/admin/navigation"
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-200/90 shadow-2xs transition-all flex items-center space-x-2"
                >
                  <FolderTree className="w-4 h-4 text-sky-600" />
                  <span>+ Add a Category</span>
                </Link>
                <Link
                  href="/admin/promotions"
                  className="px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-200/90 shadow-2xs transition-all flex items-center space-x-2"
                >
                  <Ticket className="w-4 h-4 text-pink-600" />
                  <span>Set Up a Sale</span>
                </Link>
              </div>
            </div>

            {/* Pastel dinosaur illustration watermark */}
            <div className="absolute right-4 -bottom-6 text-7xl opacity-10 select-none pointer-events-none">
              🦕
            </div>
          </div>

          {/* Quick Store Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Total Products
              </span>
              <p className="text-xl sm:text-2xl font-black text-stone-900">{products.length} Outfits</p>
              <p className="text-[10px] text-emerald-600 font-bold">
                ● {bestSellerProducts.length} Best Sellers
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Header Categories
              </span>
              <p className="text-xl sm:text-2xl font-black text-stone-900">{activeNavItems.length} Menus</p>
              <p className="text-[10px] text-stone-500 font-semibold">
                SHOP, GIRLS, BOYS, NEWBORN...
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Stock In Boutique
              </span>
              <p className="text-xl sm:text-2xl font-black text-stone-900">{inStockCount} Pieces</p>
              <p className="text-[10px] text-teal-600 font-bold">
                ✓ Ready for immediate dispatch
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Visitors Online
              </span>
              <p className="text-xl sm:text-2xl font-black text-stone-900">{visitorStats.liveVisitors} Active</p>
              <p className="text-[10px] text-emerald-600 font-bold">
                Top country: {visitorStats.topCountry}
              </p>
            </div>
          </div>

          {/* Section: 12 Large Navigation Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-stone-900">
                  What would you like to manage?
                </h2>
                <p className="text-xs text-stone-500">
                  Click any card below to open its simple management page.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {DASHBOARD_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.id}
                    href={card.href}
                    className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group space-y-4 text-left relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${card.color} shadow-2xs transition-transform group-hover:scale-110`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200/80">
                          {card.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-heading font-black text-base text-stone-900 group-hover:text-amber-800 transition-colors flex items-center justify-between">
                          <span>{card.title}</span>
                          <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-700 transition-all group-hover:translate-x-1" />
                        </h3>
                        <p className="text-xs text-stone-600 leading-relaxed font-medium">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 text-[11px] font-bold text-stone-500 group-hover:text-amber-800 flex items-center justify-between">
                      <span>{card.countText}</span>
                      <span className="text-xs font-black">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Best Sellers Snapshot on Storefront */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading text-base font-bold text-stone-900 flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Featured Outfits on Your Storefront</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  These baby outfits are currently shown on your homepage in the Parent Favorites section.
                </p>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-bold text-amber-800 hover:underline flex items-center space-x-1"
              >
                <span>Manage Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellerProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center space-x-3"
                >
                  <div className="w-12 h-14 rounded-xl relative overflow-hidden bg-white border border-stone-200 shrink-0">
                    <Image
                      src={p.images[0]?.url || '/images/products/organic-onesie.jpg'}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-900 text-xs truncate">{p.name}</p>
                    <p className="text-[11px] font-black text-amber-800">
                      {formatCurrency(p.price)}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      ★ Best Seller
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
