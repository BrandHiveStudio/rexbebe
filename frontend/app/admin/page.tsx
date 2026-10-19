'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  TrendingUp,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Globe2,
  Calendar,
  ExternalLink,
  ArrowRight,
  Filter,
  Eye,
  Plus,
  Users,
  Compass,
  FileText,
  Ticket,
  UserCheck,
} from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { useAdminData } from '../../hooks/AdminContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminDashboardPage() {
  const { products, orders, visitorLogs, visitorStats } = useAdminData();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7d' | '30d' | 'all'>('30d');

  // Filter orders according to selected period
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter(o => {
      const orderTime = new Date(o.createdAt).getTime();
      if (selectedPeriod === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        return o.createdAt.slice(0, 10) === todayStr;
      }
      if (selectedPeriod === '7d') return now - orderTime <= 7 * 86400000;
      if (selectedPeriod === '30d') return now - orderTime <= 30 * 86400000;
      return true;
    });
  }, [orders, selectedPeriod]);

  // Strict calculation: ONLY count PAID orders towards sales revenue (never count pending, cancelled or refunded)
  const paidOrders = useMemo(() => {
    return filteredOrders.filter(o => o.paymentStatus === 'PAID');
  }, [filteredOrders]);

  const totalSales = useMemo(() => {
    return paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [paidOrders]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const salesToday = useMemo(() => {
    return orders
      .filter(o => o.paymentStatus === 'PAID' && o.createdAt?.slice(0, 10) === todayStr)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders, todayStr]);

  const salesThisMonth = useMemo(() => {
    return orders
      .filter(o => o.paymentStatus === 'PAID' && o.createdAt?.slice(0, 7) === currentMonthStr)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders, currentMonthStr]);

  // Order status counts
  const totalOrdersCount = filteredOrders.length;
  const newOrdersCount = filteredOrders.filter(o => o.status === 'NEW').length;
  const processingOrdersCount = filteredOrders.filter(o => o.status === 'PROCESSING').length;
  const packedOrdersCount = filteredOrders.filter(o => o.status === 'PACKED').length;
  const shippedOrdersCount = filteredOrders.filter(o => o.status === 'SHIPPED').length;
  const completedOrdersCount = filteredOrders.filter(o => o.status === 'DELIVERED').length;
  const cancelledOrdersCount = filteredOrders.filter(o => o.status === 'CANCELLED').length;

  // Inventory & Product counts
  const totalActiveProducts = products.filter(p => p.status !== 'unpublished').length;
  const draftProducts = products.filter(p => p.status === 'draft').length;
  const publishedProducts = products.filter(p => p.status === 'published' || !p.status).length;
  const newArrivals = products.filter(p => p.isNewArrival).length;
  const saleProducts = products.filter(p => p.comparePrice && p.comparePrice > p.price).length;

  let lowStockCount = 0;
  let outOfStockCount = 0;

  const lowStockAlerts = useMemo(() => {
    const list: Array<{
      productId: string;
      productName: string;
      productSlug: string;
      variantId: string;
      sku: string;
      size: string;
      color: string;
      quantity: number;
      threshold: number;
      imageUrl: string;
      status: 'OUT_OF_STOCK' | 'LOW_STOCK';
    }> = [];

    products.forEach((p) => {
      const threshold = p.lowStockThreshold || 5;
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          const qty = v.stockQuantity ?? 0;
          if (qty <= threshold) {
            list.push({
              productId: p.id,
              productName: p.name,
              productSlug: p.slug,
              variantId: v.id,
              sku: v.sku || p.sku || 'N/A',
              size: v.size || 'Standard',
              color: v.color || (v.partColors ? Object.values(v.partColors).join(', ') : 'Standard'),
              quantity: qty,
              threshold,
              imageUrl: v.imageUrl || p.images?.[0]?.url || '/images/products/organic-onesie.jpg',
              status: qty <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            });
          }
        });
      } else {
        const qty = p.stockQuantity ?? 0;
        if (qty <= threshold) {
          list.push({
            productId: p.id,
            productName: p.name,
            productSlug: p.slug,
            variantId: `var-${p.id}`,
            sku: p.sku || 'N/A',
            size: 'Standard',
            color: 'Standard',
            quantity: qty,
            threshold,
            imageUrl: p.images?.[0]?.url || '/images/products/organic-onesie.jpg',
            status: qty <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          });
        }
      }
    });

    return list;
  }, [products]);

  products.forEach((p) => {
    const threshold = p.lowStockThreshold || 5;
    const qty = p.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) ?? p.stockQuantity ?? 0;
    if (qty <= 0) outOfStockCount++;
    else if (qty <= threshold) lowStockCount++;
  });

  // Visitor analytics breakdown
  const filteredVisitors = useMemo(() => {
    const now = Date.now();
    return visitorLogs.filter(v => {
      const vTime = new Date(v.timestamp).getTime();
      if (selectedPeriod === 'today') {
        const todayStr = new Date().toISOString().slice(0, 10);
        return v.timestamp.slice(0, 10) === todayStr;
      }
      if (selectedPeriod === '7d') return now - vTime <= 7 * 86400000;
      if (selectedPeriod === '30d') return now - vTime <= 30 * 86400000;
      return true;
    });
  }, [visitorLogs, selectedPeriod]);

  const uniqueVisitors = useMemo(() => new Set(filteredVisitors.map(v => v.ip)).size, [filteredVisitors]);

  // Country counts
  const countryCounts = useMemo(() => {
    const map: Record<string, { name: string; flag: string; count: number }> = {};
    filteredVisitors.forEach(v => {
      if (!map[v.countryCode]) {
        map[v.countryCode] = { name: v.countryName, flag: v.flag, count: 0 };
      }
      map[v.countryCode].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredVisitors]);

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Welcome to REXBEBE Store Management"
          subtitle="Manage your store, check orders, monitor stock and update your website from one place."
          actions={
            <Link
              href="/admin/products"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Add Product</span>
            </Link>
          }
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Period Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-stone-700">Reporting Period:</span>
              <span className="text-xs text-stone-500 font-medium">
                {selectedPeriod === 'today' && 'Today (Past 24 Hours)'}
                {selectedPeriod === '7d' && 'Last 7 Days'}
                {selectedPeriod === '30d' && 'Last 30 Days'}
                {selectedPeriod === 'all' && 'All Time Records'}
              </span>
            </div>
            <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedPeriod('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPeriod === 'today' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedPeriod('7d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPeriod === '7d' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setSelectedPeriod('30d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPeriod === '30d' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPeriod === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Real-time Low-Stock & Out-of-Stock Alerts Widget */}
          {lowStockAlerts.length > 0 && (
            <div className="bg-white rounded-3xl border border-amber-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-slate-900 text-sm sm:text-base">
                      Low-Stock &amp; Sold-Out Inventory Alerts ({lowStockAlerts.length})
                    </h3>
                    <p className="text-xs text-stone-600">
                      Specific clothing variants below their configured threshold or out of stock. Immediate restock recommended.
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/inventory"
                  className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-2xs transition-all self-start sm:self-auto"
                >
                  <span>Open Smart Inventory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-500 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="pb-2 px-2">Variant</th>
                      <th className="pb-2 px-2">Size</th>
                      <th className="pb-2 px-2">Colour</th>
                      <th className="pb-2 px-2">Remaining Stock</th>
                      <th className="pb-2 px-2">Status</th>
                      <th className="pb-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {lowStockAlerts.slice(0, 6).map((alert, idx) => (
                      <tr key={`${alert.variantId}-${idx}`} className="hover:bg-amber-50/30">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center space-x-2.5">
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                              <Image src={alert.imageUrl} alt={alert.productName} fill className="object-cover" />
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <span className="font-extrabold text-stone-900 block truncate">{alert.productName}</span>
                              <span className="text-[10px] text-stone-400 font-mono block">SKU: {alert.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-black text-stone-800">{alert.size}</td>
                        <td className="py-2.5 px-2 font-bold text-stone-700">{alert.color}</td>
                        <td className="py-2.5 px-2 font-mono font-black text-stone-900">
                          {alert.quantity} unit{alert.quantity === 1 ? '' : 's'} (Limit: {alert.threshold})
                        </td>
                        <td className="py-2.5 px-2">
                          {alert.status === 'OUT_OF_STOCK' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black text-[10px] uppercase">
                              Sold Out (0)
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] uppercase">
                              Low Stock ({alert.quantity})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <Link
                            href={`/admin/products?search=${encodeURIComponent(alert.productName)}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition-colors"
                          >
                            <span>Manage Variant</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION A: STORE PERFORMANCE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-stone-900">
                  Store Performance & Sales
                </h2>
                <p className="text-xs text-stone-500">
                  Actual paid revenue and order fulfillment metrics. Cancelled and unpaid orders are excluded from revenue.
                </p>
              </div>
            </div>

            {/* Sales Revenue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Total Paid Sales
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900">{formatCurrency(totalSales)}</p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  ✓ Verified {paidOrders.length} completed transactions
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 via-orange-50/40 to-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Sales Today
                  </span>
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900">{formatCurrency(salesToday)}</p>
                <p className="text-[11px] text-amber-700 font-semibold">
                  Recorded today in Colombo atelier
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 via-pink-50/40 to-white p-5 rounded-2xl border border-purple-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                    Sales This Month
                  </span>
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-stone-900">{formatCurrency(salesThisMonth)}</p>
                <p className="text-[11px] text-purple-700 font-semibold">
                  Current calendar month revenue
                </p>
              </div>
            </div>

            {/* Orders Status Cards (Clickable into Orders Page with Filter) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link
                href="/admin/orders"
                className="bg-white p-4 rounded-2xl border border-stone-200/80 hover:border-amber-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Total Orders
                </span>
                <p className="text-2xl font-black text-stone-900 group-hover:text-amber-600 transition-colors">
                  {totalOrdersCount}
                </p>
                <span className="text-[10px] text-stone-400 font-medium">All records</span>
              </Link>

              <Link
                href="/admin/orders?status=NEW"
                className="bg-white p-4 rounded-2xl border border-sky-100 hover:border-sky-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-1">
                  New Orders
                </span>
                <p className="text-2xl font-black text-sky-900 group-hover:text-sky-600 transition-colors">
                  {newOrdersCount}
                </p>
                <span className="text-[10px] text-sky-600 font-medium">● Needs packing</span>
              </Link>

              <Link
                href="/admin/orders?status=PROCESSING"
                className="bg-white p-4 rounded-2xl border border-amber-100 hover:border-amber-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  Processing
                </span>
                <p className="text-2xl font-black text-amber-900 group-hover:text-amber-600 transition-colors">
                  {processingOrdersCount}
                </p>
                <span className="text-[10px] text-amber-600 font-medium">In atelier</span>
              </Link>

              <Link
                href="/admin/orders?status=SHIPPED"
                className="bg-white p-4 rounded-2xl border border-indigo-100 hover:border-indigo-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  Shipped
                </span>
                <p className="text-2xl font-black text-indigo-900 group-hover:text-indigo-600 transition-colors">
                  {shippedOrdersCount}
                </p>
                <span className="text-[10px] text-indigo-600 font-medium">In transit</span>
              </Link>

              <Link
                href="/admin/orders?status=DELIVERED"
                className="bg-white p-4 rounded-2xl border border-emerald-100 hover:border-emerald-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Completed
                </span>
                <p className="text-2xl font-black text-emerald-900 group-hover:text-emerald-600 transition-colors">
                  {completedOrdersCount}
                </p>
                <span className="text-[10px] text-emerald-600 font-medium">Delivered</span>
              </Link>

              <Link
                href="/admin/orders?status=CANCELLED"
                className="bg-white p-4 rounded-2xl border border-rose-100 hover:border-rose-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                  Cancelled
                </span>
                <p className="text-2xl font-black text-rose-900 group-hover:text-rose-600 transition-colors">
                  {cancelledOrdersCount}
                </p>
                <span className="text-[10px] text-rose-600 font-medium">Refunded</span>
              </Link>
            </div>
          </div>

          {/* SECTION B: PRODUCT AND INVENTORY OVERVIEW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-black text-stone-900">
                  Product & Inventory Health
                </h2>
                <p className="text-xs text-stone-500">
                  Stock availability, live published garments, and draft items. Click any card to manage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <Link
                href="/admin/products"
                className="bg-white p-4 rounded-2xl border border-stone-200/80 hover:border-amber-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Active Items
                </span>
                <p className="text-2xl font-black text-stone-900 group-hover:text-amber-600">{totalActiveProducts}</p>
                <span className="text-[10px] text-stone-400 font-medium">In catalogue</span>
              </Link>

              <Link
                href="/admin/products?status=published"
                className="bg-white p-4 rounded-2xl border border-emerald-100 hover:border-emerald-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Published
                </span>
                <p className="text-2xl font-black text-emerald-900 group-hover:text-emerald-600">{publishedProducts}</p>
                <span className="text-[10px] text-emerald-600 font-medium">Visible to shoppers</span>
              </Link>

              <Link
                href="/admin/products?status=draft"
                className="bg-white p-4 rounded-2xl border border-amber-100 hover:border-amber-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  Drafts
                </span>
                <p className="text-2xl font-black text-amber-900 group-hover:text-amber-600">{draftProducts}</p>
                <span className="text-[10px] text-amber-600 font-medium">Not yet public</span>
              </Link>

              <Link
                href="/admin/inventory?status=LOW_STOCK"
                className="bg-white p-4 rounded-2xl border border-orange-100 hover:border-orange-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block mb-1">
                  Low Stock
                </span>
                <p className="text-2xl font-black text-orange-900 group-hover:text-orange-600">{lowStockCount}</p>
                <span className="text-[10px] text-orange-600 font-medium">Needs reorder</span>
              </Link>

              <Link
                href="/admin/inventory?status=OUT_OF_STOCK"
                className="bg-white p-4 rounded-2xl border border-rose-100 hover:border-rose-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                  Out of Stock
                </span>
                <p className="text-2xl font-black text-rose-900 group-hover:text-rose-600">{outOfStockCount}</p>
                <span className="text-[10px] text-rose-600 font-medium">0 units left</span>
              </Link>

              <Link
                href="/admin/products?filter=new"
                className="bg-white p-4 rounded-2xl border border-pink-100 hover:border-pink-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 block mb-1">
                  New In
                </span>
                <p className="text-2xl font-black text-pink-900 group-hover:text-pink-600">{newArrivals}</p>
                <span className="text-[10px] text-pink-600 font-medium">✨ NEW badge</span>
              </Link>

              <Link
                href="/admin/products?filter=sale"
                className="bg-white p-4 rounded-2xl border border-amber-100 hover:border-amber-400 shadow-2xs hover:shadow transition-all group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  On Sale
                </span>
                <p className="text-2xl font-black text-amber-900 group-hover:text-amber-600">{saleProducts}</p>
                <span className="text-[10px] text-amber-600 font-medium">🍑 SALE badge</span>
              </Link>
            </div>
          </div>

          {/* SECTION C: GLOBAL VISITOR INSIGHTS OVERVIEW */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Globe2 className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-heading font-black text-stone-900">
                    Global Visitor Insights
                  </h2>
                </div>
                <p className="text-xs text-stone-500">
                  Real traffic insights from international shoppers visiting REXBEBE boutique.
                </p>
              </div>

              <Link
                href="/admin/visitors"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200/80 hover:bg-amber-100 transition-all"
              >
                <span>View Complete Visitor Analytics</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Total Visits
                </span>
                <p className="text-2xl font-black text-stone-900">{filteredVisitors.length}</p>
                <span className="text-[10px] text-stone-500">During {selectedPeriod}</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Unique Visitors
                </span>
                <p className="text-2xl font-black text-stone-900">{uniqueVisitors}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Reliably measured IPs</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Top Visiting Countries
                </span>
                <div className="flex items-center space-x-2 pt-1">
                  {countryCounts.map(c => (
                    <span key={c.name} className="text-base" title={`${c.name}: ${c.count} visits`}>
                      {c.flag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-stone-500">
                  {countryCounts[0] ? `${countryCounts[0].name} leads traffic` : 'Global coverage'}
                </span>
              </div>
            </div>

            {/* Top Country Table */}
            {countryCounts.length > 0 ? (
              <div className="border border-stone-200/80 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200/80 text-stone-600 font-bold">
                    <tr>
                      <th className="p-3">Country</th>
                      <th className="p-3">Total Visits</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {countryCounts.map(c => {
                      const pct = Math.round((c.count / (filteredVisitors.length || 1)) * 100);
                      return (
                        <tr key={c.name} className="hover:bg-stone-50/50">
                          <td className="p-3 flex items-center space-x-2 font-bold text-stone-900">
                            <span className="text-base">{c.flag}</span>
                            <span>{c.name}</span>
                          </td>
                          <td className="p-3 font-semibold text-stone-700">{c.count} visits</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-stone-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-bold text-stone-600">{pct}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200/60">
                <p className="text-sm font-bold text-stone-500">No visitor records for the selected period.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
