'use client';

import React from 'react';
import Link from 'next/link';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { Compass, Sparkles, ArrowRight, FolderTree } from 'lucide-react';
import { useAdminData } from '../../../hooks/AdminContext';

export default function AdminCategoriesPage() {
  const { navigationConfig } = useAdminData();

  const categories = navigationConfig?.items || [];

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Categories & Navigation"
          subtitle="Manage all store categories, submenus, images, descriptions, products and publication status"
          actions={
            <Link
              href="/admin/navigation"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>Open Navigation & Categories Studio →</span>
            </Link>
          }
        />
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl">
          {/* Spotlight Banner */}
          <div className="p-6 bg-gradient-to-r from-amber-100/90 via-orange-50 to-pink-50 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full inline-block">
                ✨ Live Storefront Architecture
              </span>
              <h3 className="font-heading font-black text-lg text-stone-900">
                Manage Dynamic Navigation & Categories
              </h3>
              <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
                Add categories, submenu items, banner uploads, product assignments, drafts, and live previews directly inside the unified Navigation & Categories Studio.
              </p>
            </div>
            <Link
              href="/admin/navigation"
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-amber-400 font-bold text-xs hover:bg-stone-800 transition-colors shrink-0 flex items-center space-x-1.5 shadow-sm"
            >
              <span>Manage in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Current Live Categories Table */}
          <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-heading font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
                <FolderTree className="w-4 h-4 text-amber-600" />
                <span>Storefront Categories ({categories.length})</span>
              </span>
              <Link
                href="/admin/navigation"
                className="text-xs font-bold text-amber-800 hover:underline"
              >
                Edit in Studio →
              </Link>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200/80 text-stone-600">
                <tr>
                  <th className="p-4 font-bold">Category Name</th>
                  <th className="p-4 font-bold">Destination URL</th>
                  <th className="p-4 font-bold">Submenus</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories.map((c) => {
                  const subCount = (c.subGroups || []).reduce((acc, g) => acc + (g.subItems?.length || 0), 0);
                  return (
                    <tr key={c.id} className="hover:bg-stone-50">
                      <td className="p-4 font-bold text-stone-900">
                        {c.name}
                        {c.badge && (
                          <span className="ml-2 text-[9px] font-black uppercase bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded">
                            {c.badge}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-stone-500 font-mono">{c.href}</td>
                      <td className="p-4 font-semibold text-stone-700">
                        {subCount > 0 ? `${subCount} submenu items` : 'Direct Link'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-400'}`}>
                          {c.isActive ? 'ACTIVE' : 'HIDDEN'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href="/admin/navigation"
                          className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/60 transition-colors"
                        >
                          Configure
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
