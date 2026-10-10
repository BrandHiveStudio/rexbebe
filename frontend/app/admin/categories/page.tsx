'use client';

import React from 'react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';

export default function AdminCategoriesPage() {
  const categories = [
    { name: 'Baby Clothing', slug: 'baby-clothing', count: 48 },
    { name: 'Nursery & Toys', slug: 'nursery-toys', count: 32 },
    { name: 'Bedding & Swaddles', slug: 'bedding-swaddles', count: 24 },
    { name: 'Baby Gear & Travel', slug: 'gear-travel', count: 16 },
  ];

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Category Management" />
        <main className="p-8">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="p-4 font-bold">Category Name</th>
                  <th className="p-4 font-bold">Slug</th>
                  <th className="p-4 font-bold">Total Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories.map(c => (
                  <tr key={c.slug} className="hover:bg-stone-50">
                    <td className="p-4 font-bold text-stone-900">{c.name}</td>
                    <td className="p-4 text-stone-500">{c.slug}</td>
                    <td className="p-4 font-semibold text-stone-900">{c.count} items</td>
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
