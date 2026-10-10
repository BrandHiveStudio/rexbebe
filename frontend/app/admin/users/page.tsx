'use client';

import React from 'react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';

export default function AdminUsersPage() {
  const users = [
    { name: 'REXBEBE Admin Executive', email: 'admin@rexbebe.com', role: 'SUPER_ADMIN', lastLogin: '2026-10-06 20:15' },
    { name: 'Store Manager', email: 'manager@rexbebe.com', role: 'ADMIN', lastLogin: '2026-10-05 14:22' }
  ];

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Admin Users & Role Governance" />
        <main className="p-8">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="p-4 font-bold">User Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map(u => (
                  <tr key={u.email} className="hover:bg-stone-50">
                    <td className="p-4 font-bold text-stone-900">{u.name}</td>
                    <td className="p-4 text-stone-600">{u.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-brand-100 text-brand-900 font-bold rounded text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-stone-500">{u.lastLogin}</td>
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
