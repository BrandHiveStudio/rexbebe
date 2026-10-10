'use client';

import React from 'react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { Button } from '../../../components/ui/Button';

export default function AdminSettingsPage() {
  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="System & Integration Settings" />
        <main className="p-8 max-w-4xl space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
              REST API & Integration Endpoints
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Backend Server Base URL</label>
                <input type="text" readOnly value="http://localhost:5000/api" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-600" />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">PostgreSQL Connection Status</label>
                <input type="text" readOnly value="Active (Prisma ORM)" className="w-full p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-stone-700 font-bold mb-1">Future Integration Readiness</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['POS Sync', 'ERP Connector', 'Delivery Courier API', 'WhatsApp Business', 'SMS Gateway', 'Email SMTP', 'Analytics'].map(i => (
                  <span key={i} className="px-3 py-1 bg-stone-100 text-stone-700 font-semibold rounded-full border border-stone-200 text-[10px]">
                    ✓ {i} Ready
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
