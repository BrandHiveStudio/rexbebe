'use client';

import React from 'react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';

export default function AdminReturnsPage() {
  const returns = [
    { id: 'ret-1', orderId: 'RXB-2026-9041', customer: 'Elena Rostova', reason: 'Incorrect size ordered', status: 'REQUESTED', amount: 18500 }
  ];

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Returns & Replacement Center" />
        <main className="p-8">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="p-4 font-bold">Return ID</th>
                  <th className="p-4 font-bold">Order #</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Reason</th>
                  <th className="p-4 font-bold">Refund Value</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {returns.map(r => (
                  <tr key={r.id} className="hover:bg-stone-50">
                    <td className="p-4 font-bold text-stone-900">{r.id}</td>
                    <td className="p-4 text-stone-600">{r.orderId}</td>
                    <td className="p-4 text-stone-800">{r.customer}</td>
                    <td className="p-4 text-stone-600">{r.reason}</td>
                    <td className="p-4 font-bold text-stone-900">LKR {r.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded text-[10px]">
                        {r.status}
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
