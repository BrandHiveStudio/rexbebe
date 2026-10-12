'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Search, ExternalLink, ShieldCheck, Sparkles, Globe2, Menu } from 'lucide-react';
import { useAdminData } from '../../hooks/AdminContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const { visitorStats } = useAdminData();

  return (
    <header className="min-h-16 bg-white border-b border-stone-200 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-admin-nav'));
            }
          }}
          className="lg:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors focus:outline-none"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold font-heading text-stone-900 tracking-tight">{title}</h1>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Admin Portal</span>
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-stone-500 mt-0.5 font-medium line-clamp-1 sm:line-clamp-none">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-3">
        {actions}

        {/* Live Visitor Indicator */}
        <Link
          href="/admin/analytics"
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors text-xs font-semibold"
          title="View live visitors & countries"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{visitorStats.liveVisitors} Live Visitors</span>
        </Link>

        {/* Public Storefront Preview Button */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
          title="Open Public Storefront"
        >
          <span>View Live Store</span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
        </Link>

        <div className="flex items-center space-x-3 pl-3 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 text-white flex items-center justify-center font-black text-xs shadow-xs">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-stone-900 leading-none">Rexbebe Admin</p>
            <p className="text-[10px] text-stone-500 mt-0.5 leading-none">admin@rexbebe.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
