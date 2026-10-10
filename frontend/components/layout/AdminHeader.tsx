'use client';

import React from 'react';
import { Bell, ShieldCheck, Search } from 'lucide-react';

export function AdminHeader({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-bold text-stone-900">{title}</h1>
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          REST API Live Connected
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search orders, SKU, customers..."
            className="pl-9 pr-4 py-1.5 bg-stone-100 border border-transparent rounded-lg text-xs focus:bg-white focus:border-brand-500 focus:outline-none w-64"
          />
        </div>

        <button className="p-2 text-stone-500 hover:text-stone-700 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-stone-900 leading-none">Admin Executive</p>
            <p className="text-[10px] text-stone-500 mt-0.5 leading-none">admin@rexbebe.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
