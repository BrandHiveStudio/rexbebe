'use client';

import React from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { ShoppingBag, Users, DollarSign, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminDashboardPage() {
  const stats = [
    { name: 'Total Revenue', value: formatCurrency(1245000), icon: DollarSign, change: '+14.2%' },
    { name: 'Total Orders', value: '148 Orders', icon: ShoppingBag, change: '+8.4%' },
    { name: 'Active Customers', value: '312 Members', icon: Users, change: '+22.1%' },
    { name: 'In-Stock Variants', value: '84 SKUs', icon: Package, change: 'Optimal' },
  ];

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Enterprise Dashboard Overview" />
        <main className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{s.name}</span>
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-xl font-bold text-stone-900">{s.value}</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {s.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Recent Enterprise Activity & API Audit Trail</h3>
            <div className="text-xs text-stone-600 space-y-3">
              <div className="p-3 bg-stone-50 rounded-lg flex items-center justify-between border border-stone-100">
                <span>[ORDER CREATION] Order RXB-2026-9041 verified via REST API with 2 server-validated items.</span>
                <span className="text-stone-400 text-[10px]">2 mins ago</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg flex items-center justify-between border border-stone-100">
                <span>[PAYMENT CALLBACK] PayHere Gateway MD5 signature validated for order #RXB-2026-9041.</span>
                <span className="text-stone-400 text-[10px]">5 mins ago</span>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
