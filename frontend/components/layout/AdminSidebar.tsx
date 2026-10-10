'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  ShoppingBag,
  Users,
  CreditCard,
  Ticket,
  RotateCcw,
  BarChart3,
  UserCheck,
  Settings,
  ArrowLeft
} from 'lucide-react';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Returns', href: '/admin/returns', icon: RotateCcw },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: UserCheck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 min-h-screen flex flex-col justify-between border-r border-stone-800">
      <div>
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold tracking-wider text-white">REXBEBE</h2>
            <span className="text-[10px] uppercase tracking-widest text-brand-400 font-medium">Enterprise Admin</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {ADMIN_LINKS.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'hover:bg-stone-800 hover:text-white text-stone-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-stone-800">
        <Link
          href="/"
          className="flex items-center space-x-2 text-xs text-stone-400 hover:text-white px-3 py-2 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Storefront</span>
        </Link>
      </div>
    </aside>
  );
}
