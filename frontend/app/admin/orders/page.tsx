'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { Button } from '../../../components/ui/Button';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  RefreshCw,
  CreditCard,
  User,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  country: string;
  date: string;
  total: number;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  carrier?: string;
  itemsCount: number;
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ord_1',
    orderNumber: 'REX-84920',
    customerName: 'Charlotte De Silva',
    email: 'charlotte@example.com',
    country: 'United States 🇺🇸',
    date: '2026-10-08',
    total: 38000,
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    trackingNumber: 'DHL-984210492',
    carrier: 'DHL Express',
    itemsCount: 3,
  },
  {
    id: 'ord_2',
    orderNumber: 'REX-84921',
    customerName: 'Marcus Vance',
    email: 'marcus.v@example.com',
    country: 'United Kingdom 🇬🇧',
    date: '2026-10-08',
    total: 24500,
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    itemsCount: 2,
  },
  {
    id: 'ord_3',
    orderNumber: 'REX-84922',
    customerName: 'Elena Rostova',
    email: 'elena@example.com',
    country: 'Germany 🇩🇪',
    date: '2026-10-07',
    total: 51200,
    paymentStatus: 'PAID',
    orderStatus: 'CONFIRMED',
    itemsCount: 4,
  },
  {
    id: 'ord_4',
    orderNumber: 'REX-84923',
    customerName: 'Kavinda Perera',
    email: 'kavinda@example.lk',
    country: 'Sri Lanka 🇱🇰',
    date: '2026-10-06',
    total: 18500,
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    trackingNumber: 'PRONT-4482',
    carrier: 'Pronto Courier',
    itemsCount: 1,
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleUpdateStatus = (
    orderId: string,
    newStatus: OrderItem['orderStatus'],
    tracking?: string,
    carrier?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: newStatus,
              trackingNumber: tracking || o.trackingNumber,
              carrier: carrier || o.carrier,
            }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: newStatus,
              trackingNumber: tracking || prev.trackingNumber,
              carrier: carrier || prev.carrier,
            }
          : null
      );
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Order Fulfillment & Management" />
        <main className="p-8 space-y-8">
          
          {/* Top Bar Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5" />
                <span>Admin Operations Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Global Order Fulfillment &amp; Management
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Manage order statuses, payments, carrier tracking assignments, and customer dispatch.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setOrders([...MOCK_ORDERS])}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Orders</span>
              </button>
            </div>
          </div>

          {/* KPI Analytics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
              <span className="text-xs text-stone-400 font-medium">Total Volume</span>
              <p className="text-xl font-extrabold text-stone-900 mt-1">{orders.length} Orders</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
              <span className="text-xs text-stone-400 font-medium">Processing Queue</span>
              <p className="text-xl font-extrabold text-amber-600 mt-1">
                {orders.filter((o) => o.orderStatus === 'PROCESSING' || o.orderStatus === 'CONFIRMED').length} Orders
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
              <span className="text-xs text-stone-400 font-medium">In Transit</span>
              <p className="text-xl font-extrabold text-sky-600 mt-1">
                {orders.filter((o) => o.orderStatus === 'SHIPPED').length} Orders
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
              <span className="text-xs text-stone-400 font-medium">Revenue Settled</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1">
                {formatCurrency(orders.reduce((acc, o) => acc + o.total, 0))}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order #, customer, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-stone-400 flex-shrink-0" />
                {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                      statusFilter === st
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border border-stone-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Destination</th>
                    <th className="p-3.5">Payment Status</th>
                    <th className="p-3.5">Order Status</th>
                    <th className="p-3.5">Total Amount</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="p-3.5 font-bold text-purple-950">{order.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-900">{order.customerName}</div>
                        <div className="text-[11px] text-stone-400">{order.email}</div>
                      </td>
                      <td className="p-3.5">{order.country}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            order.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'SHIPPED'
                              ? 'bg-sky-100 text-sky-800'
                              : order.orderStatus === 'PROCESSING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-stone-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-purple-100 text-purple-950 transition-colors"
                          title="Manage Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manage Order Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-white/80">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900">
                      Manage Order {selectedOrder.orderNumber}
                    </h2>
                    <span className="text-xs text-stone-400">Placed on {selectedOrder.date}</span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-stone-400 hover:text-stone-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="bg-stone-50 p-4 rounded-2xl space-y-2 border border-stone-200/60">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Customer:</span>
                      <span className="font-bold text-stone-800">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Destination:</span>
                      <span className="font-bold text-stone-800">{selectedOrder.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Payment:</span>
                      <span className="font-bold text-emerald-700">{selectedOrder.paymentStatus}</span>
                    </div>
                  </div>

                  {/* Update Order Status */}
                  <div className="space-y-2">
                    <label className="font-bold text-stone-700">Update Order Lifecycle Status:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map(
                        (st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                            className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                              selectedOrder.orderStatus === st
                                ? 'bg-purple-900 text-white border-purple-900 shadow-2xs'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Dispatch & Carrier Tracking */}
                  <div className="space-y-2 pt-2">
                    <label className="font-bold text-stone-700">Assign Courier &amp; Tracking ID:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Carrier (e.g. DHL Express)"
                        defaultValue={selectedOrder.carrier || ''}
                        id="carrierInput"
                        className="p-2.5 rounded-xl border border-stone-200 text-stone-800 text-xs focus:ring-2 focus:ring-pink-300"
                      />
                      <input
                        type="text"
                        placeholder="Tracking Number"
                        defaultValue={selectedOrder.trackingNumber || ''}
                        id="trackingInput"
                        className="p-2.5 rounded-xl border border-stone-200 text-stone-800 text-xs focus:ring-2 focus:ring-pink-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t border-stone-100 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const carrierVal = (document.getElementById('carrierInput') as HTMLInputElement)?.value;
                      const trackingVal = (document.getElementById('trackingInput') as HTMLInputElement)?.value;
                      handleUpdateStatus(
                        selectedOrder.id,
                        selectedOrder.orderStatus,
                        trackingVal,
                        carrierVal
                      );
                      setSelectedOrder(null);
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
