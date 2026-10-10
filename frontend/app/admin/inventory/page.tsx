'use client';

import React from 'react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';

export default function AdminInventoryPage() {
  const stock = [
    { sku: 'AUREL-OAT-03M', title: 'Aurelia Cashmere Romper (Oatmeal 0-3M)', quantity: 25, reserved: 2 },
    { sku: 'AUREL-OAT-06M', title: 'Aurelia Cashmere Romper (Oatmeal 3-6M)', quantity: 18, reserved: 0 },
    { sku: 'GYM-WOOD-STD', title: 'Nordic Artisan Wooden Play Gym', quantity: 14, reserved: 1 },
    { sku: 'SWAD-SAGE-SET', title: 'Maison Luxe Swaddle Set (Sage)', quantity: 30, reserved: 0 },
    { sku: 'STR-ONYX-GLD', title: 'Celeste Stroller (Onyx Black)', quantity: 8, reserved: 1 },
  ];

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Inventory Management & Stock Auditing" />
        <main className="p-8">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="p-4 font-bold">SKU Code</th>
                  <th className="p-4 font-bold">Variant Title</th>
                  <th className="p-4 font-bold">Available Stock</th>
                  <th className="p-4 font-bold">Reserved</th>
                  <th className="p-4 font-bold">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stock.map(s => (
                  <tr key={s.sku} className="hover:bg-stone-50">
                    <td className="p-4 font-bold text-stone-900">{s.sku}</td>
                    <td className="p-4 text-stone-700">{s.title}</td>
                    <td className="p-4 font-bold text-stone-900">{s.quantity} units</td>
                    <td className="p-4 text-amber-600">{s.reserved} reserved</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">
                        IN STOCK
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
