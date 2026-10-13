'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Mail,
  Phone,
  MapPin,
  Truck,
  Clock,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';

interface StoreSettingsData {
  storeName: string;
  tagline: string;
  supportEmail: string;
  orderNotificationEmail: string;
  phone: string;
  address: string;
  supportHours: string;
  currency: string;
  freeShippingThreshold: number;
  standardDeliveryFee: number;
}

const DEFAULT_SETTINGS: StoreSettingsData = {
  storeName: 'REXBEBE Baby Boutique',
  tagline: 'Little Moments, Big Adventures 🦕✨',
  supportEmail: 'care@rexbebe.com',
  orderNotificationEmail: 'orders@rexbebe.com',
  phone: '+94 77 123 4567',
  address: '142 Galle Road, Colombo 03, Sri Lanka',
  supportHours: 'Monday – Saturday: 9:00 AM – 6:00 PM',
  currency: 'LKR (Sri Lankan Rupee)',
  freeShippingThreshold: 10000,
  standardDeliveryFee: 650,
};

const STORAGE_KEY = 'rexbebe_admin_store_settings';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettingsData>(DEFAULT_SETTINGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // Use defaults
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    showToast('Your store details have been saved successfully! 🌸');
  };

  const handleReset = () => {
    if (confirm('Reset store information to brand defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      }
      showToast('Store settings reset to defaults.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Store Settings"
          subtitle="Manage your store name, contact information, boutique address, and delivery options."
          actions={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold transition-all shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            </div>
          }
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl bg-stone-900 text-amber-400 border border-amber-500/30 text-xs font-bold shadow-xl animate-fadeIn flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Boutique Identity */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-2xs space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-stone-100 pb-3">
                <Store className="w-5 h-5 text-amber-800" />
                <div>
                  <h3 className="font-heading font-black text-base text-stone-900">
                    Boutique Details
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    The name and tagline customers see across your store.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Store Name</label>
                  <input
                    type="text"
                    required
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    Appears in header, invoice receipts, and emails.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    A short motto shown in the footer and announcement bar.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Customer Concierge & Contact */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-2xs space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-stone-100 pb-3">
                <Mail className="w-5 h-5 text-sky-700" />
                <div>
                  <h3 className="font-heading font-black text-base text-stone-900">
                    Contact & Concierge Information
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Where parents and customers can reach your team for help.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Customer Support Email</label>
                  <input
                    type="email"
                    required
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    Customers use this to ask about orders and sizing.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Order Notifications Email</label>
                  <input
                    type="email"
                    required
                    value={settings.orderNotificationEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, orderNotificationEmail: e.target.value })
                    }
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    Where you receive order alerts when customers checkout.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Concierge Hours</label>
                  <input
                    type="text"
                    value={settings.supportHours}
                    onChange={(e) => setSettings({ ...settings, supportHours: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-stone-700 font-bold block">Atelier Physical Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    Displayed on invoices and the Contact Us page.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Currency & Shipping Rules */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-2xs space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-stone-100 pb-3">
                <Truck className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="font-heading font-black text-base text-stone-900">
                    Delivery & Currency Rules
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Configure standard shipping rates and free delivery thresholds.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Store Currency</label>
                  <input
                    type="text"
                    readOnly
                    value={settings.currency}
                    className="w-full p-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 font-bold"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    Prices are processed in Sri Lankan Rupees (LKR).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">
                    Free Delivery Threshold (LKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={settings.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                    }
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    Orders above this amount receive free delivery.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Standard Delivery Fee (LKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={settings.standardDeliveryFee}
                    onChange={(e) =>
                      setSettings({ ...settings, standardDeliveryFee: Number(e.target.value) })
                    }
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    Charged on orders below the free delivery threshold.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md shadow-amber-900/10 transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Store Details</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
