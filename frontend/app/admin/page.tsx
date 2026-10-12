'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Users,
  Package,
  Globe2,
  Sparkles,
  Star,
  Compass,
  LayoutTemplate,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { useAdminData } from '../../hooks/AdminContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminDashboardPage() {
  const { products, homepageConfig, navigationConfig, visitorLogs, visitorStats } = useAdminData();

  const bestSellerProducts = products.filter((p) => p.isBestSeller);
  const recentVisitors = visitorLogs.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Enterprise Executive Dashboard"
          subtitle="Real-time control center for REXBEBE boutique operations, storefront design, and international audience"
          actions={
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Preview Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          }
        />

        <main className="p-6 lg:p-8 space-y-8 max-w-7xl">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Products Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Active Products
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-stone-900">{products.length} Items</p>
                <Link
                  href="/admin/products"
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline"
                >
                  Manage
                </Link>
              </div>
              <p className="text-[11px] text-stone-500">
                <strong className="text-emerald-600 font-bold">{bestSellerProducts.length}</strong> marked as Best Sellers
              </p>
            </div>

            {/* Live Visitors Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Live Traffic & Geo
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Globe2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-stone-900">{visitorStats.liveVisitors} Online</p>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ● Real-time
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Top country: <strong className="text-stone-900">{visitorStats.topCountry}</strong> ({visitorStats.uniqueVisitors} unique IPs)
              </p>
            </div>

            {/* Homepage Customizer Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Homepage Studio
                </span>
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-stone-900">8 Sections</p>
                <Link
                  href="/admin/homepage"
                  className="text-[11px] font-bold text-pink-600 hover:text-pink-700 underline"
                >
                  Customize
                </Link>
              </div>
              <p className="text-[11px] text-stone-500">
                Hero: <strong className="text-stone-800 font-bold">{homepageConfig.hero.headlineLine1}</strong>
              </p>
            </div>

            {/* Navigation Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Storefront Navbar
                </span>
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-stone-900">
                  {navigationConfig.items.filter((i) => i.isActive).length} Links
                </p>
                <Link
                  href="/admin/navigation"
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 underline"
                >
                  Configure
                </Link>
              </div>
              <p className="text-[11px] text-stone-500">
                Capsule track with sub-navigation dropdowns
              </p>
            </div>
          </div>

          {/* Quick Action Control Strip */}
          <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/10 p-6 rounded-3xl border border-amber-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-amber-950 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Quick Customization & Store Controls</span>
              </h3>
              <p className="text-xs text-amber-900/80">
                Direct shortcuts to manage homepage elements, items, navbar, and visitors
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/admin/homepage"
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs border border-stone-200 shadow-2xs transition-all flex items-center space-x-1.5"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-pink-600" />
                <span>Customize Homepage</span>
              </Link>

              <Link
                href="/admin/products"
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs border border-stone-200 shadow-2xs transition-all flex items-center space-x-1.5"
              >
                <Star className="w-3.5 h-3.5 text-emerald-600" />
                <span>Manage Best Sellers</span>
              </Link>

              <Link
                href="/admin/navigation"
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs border border-stone-200 shadow-2xs transition-all flex items-center space-x-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                <span>Edit Navbar & Sub-menus</span>
              </Link>

              <Link
                href="/admin/analytics"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5"
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Live Visitor IPs</span>
              </Link>
            </div>
          </div>

          {/* Dual Panel: Live Visitor IPs + Best Sellers Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Real-Time Visitor IP Stream (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-stone-900 flex items-center space-x-2">
                    <Globe2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-Time Visitor IP & Country Feed</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Latest visitors recorded on the public website
                  </p>
                </div>
                <Link
                  href="/admin/analytics"
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center space-x-1"
                >
                  <span>Full Intelligence</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-stone-100">
                {recentVisitors.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{v.flag}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-stone-900">{v.ip}</span>
                          <span className="text-[10px] text-stone-500 font-semibold">({v.countryName})</span>
                        </div>
                        <p className="text-[10px] text-stone-400">
                          {v.city} • Page: <code className="font-bold text-stone-600">{v.page}</code>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {v.device}
                      </span>
                      <p className="text-[10px] text-stone-400 mt-0.5">{v.visitsCount} hits</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Best Sellers Spotlight (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-stone-900 flex items-center space-x-2">
                    <Star className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                    <span>Best Sellers on Storefront</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Items currently featured in the "Parent Favorites" homepage carousel
                  </p>
                </div>
                <Link
                  href="/admin/products"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                >
                  <span>Edit All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {bestSellerProducts.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 text-xs text-center font-medium">
                    No items marked as Best Seller yet. Head over to Products to mark your top sellers!
                  </div>
                ) : (
                  bestSellerProducts.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-12 rounded-xl relative overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                          <Image
                            src={p.images[0]?.url || '/images/products/organic-onesie.jpg'}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-[170px]">
                          <p className="font-bold text-stone-900 text-xs truncate">{p.name}</p>
                          <p className="text-[11px] font-black text-amber-800">
                            {formatCurrency(p.price)}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                        🌿 BEST SELLER
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
