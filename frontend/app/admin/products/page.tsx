'use client';

import React from 'react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { INITIAL_PRODUCTS } from '../../../hooks/useCart';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function AdminProductsPage() {
  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Product Management" />
        <main className="p-8">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="p-4 font-bold">Product Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold">Variants</th>
                  <th className="p-4 font-bold">Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {INITIAL_PRODUCTS.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="p-4 font-bold text-stone-900">{p.name}</td>
                    <td className="p-4 text-stone-500">{p.category.name}</td>
                    <td className="p-4 font-semibold text-stone-900">{formatCurrency(p.price)}</td>
                    <td className="p-4 text-stone-600">{p.variants.length} SKUs</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isFeatured ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                        {p.isFeatured ? 'YES' : 'NO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
