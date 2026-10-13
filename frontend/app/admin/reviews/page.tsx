'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  CheckCircle2,
  XCircle,
  EyeOff,
  Eye,
  Trash2,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Package,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { useAdminData } from '../../../hooks/AdminContext';

interface AdminReview {
  id: string;
  name: string;
  location: string;
  productName: string;
  productImage?: string;
  rating: number;
  date: string;
  comment: string;
  status: 'approved' | 'pending' | 'hidden';
  verified: boolean;
}

const INITIAL_REVIEWS: AdminReview[] = [
  {
    id: 'rev-1',
    name: 'Elena Rostova',
    location: 'Colombo, Sri Lanka',
    productName: 'Aurelia Organic Cashmere Romper',
    productImage: '/images/products/organic-onesie.jpg',
    rating: 5,
    date: 'February 2026',
    comment:
      'The Aurelia cashmere romper is insanely soft! My 4-month-old daughter looks adorable and sleeps so comfortably in it. The quality exceeds luxury European boutiques.',
    status: 'approved',
    verified: true,
  },
  {
    id: 'rev-2',
    name: 'Samantha & Noah',
    location: 'Kandy, Sri Lanka',
    productName: 'Nordic Artisan Wooden Play Gym',
    productImage: '/images/products/baby-boy-adventure.jpg',
    rating: 5,
    date: 'January 2026',
    comment:
      'The wooden play gym is a masterpiece. Solid beechwood with hand-crocheted rattles that keep our little boy mesmerized for hours. Packaging was gorgeous!',
    status: 'approved',
    verified: true,
  },
  {
    id: 'rev-3',
    name: 'Dr. Priya Fernando',
    location: 'Galle, Sri Lanka',
    productName: 'Maison Luxe Organic Linen Swaddle',
    productImage: '/images/products/editorial-baby-lifestyle.jpg',
    rating: 5,
    date: 'March 2026',
    comment:
      'As a pediatrician and mom, I am super picky about fabrics. REXBEBE’s French linen swaddles are 100% breathable and get softer after every single wash.',
    status: 'approved',
    verified: true,
  },
  {
    id: 'rev-4',
    name: 'Eleanor Vance',
    location: 'London, UK',
    productName: 'Aurelia Organic Cashmere Romper',
    productImage: '/images/products/organic-onesie.jpg',
    rating: 5,
    date: 'February 2026',
    comment:
      'The cashmere is so whisper-soft on my newborn daughter’s skin. The packaging felt like opening a gift from a high-end French atelier. Worth every single penny.',
    status: 'approved',
    verified: true,
  },
  {
    id: 'rev-5',
    name: 'Liam & Sophia Becker',
    location: 'Zurich, Switzerland',
    productName: 'Nordic Artisan Wooden Play Gym',
    productImage: '/images/products/wooden-gym.jpg',
    rating: 5,
    date: 'January 2026',
    comment:
      'Exceptional craftsmanship! The beechwood is completely smooth with no synthetic smells, and our 4-month-old is mesmerized by the crocheted sensory pendants.',
    status: 'pending',
    verified: true,
  },
  {
    id: 'rev-6',
    name: 'Amara Wijesinghe',
    location: 'Colombo, Sri Lanka',
    productName: 'Petit Prince Cashmere Cardigan & Bonnet',
    productImage: '/images/products/baby-girl-fashion.jpg',
    rating: 4,
    date: 'February 2026',
    comment:
      'We bought this for our baby boy’s first blessing ceremony. The mother-of-pearl buttons and gentle cable knit made for stunning milestone photos.',
    status: 'pending',
    verified: true,
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rexbebe_admin_reviews');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved reviews');
        }
      }
    }
    return INITIAL_REVIEWS;
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveReviews = (newList: AdminReview[]) => {
    setReviews(newList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rexbebe_admin_reviews', JSON.stringify(newList));
    }
  };

  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'pending' | 'hidden') => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    saveReviews(updated);
    showToast(
      newStatus === 'approved'
        ? 'Review approved and published to storefront!'
        : newStatus === 'hidden'
        ? 'Review hidden from storefront.'
        : 'Review marked as pending moderation.'
    );
  };

  const handleDeleteReview = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete review from ${name}?`)) {
      const updated = reviews.filter((r) => r.id !== id);
      saveReviews(updated);
      showToast('Review removed permanently.');
    }
  };

  const filteredReviews = reviews
    .filter((r) => {
      if (filterStatus === 'all') return true;
      return r.status === filterStatus;
    })
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    });

  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / (totalReviews || 1)).toFixed(1);

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Customer Reviews Moderation"
          subtitle="Manage genuine customer feedback, moderate testimonials, and control reviews displayed across the storefront"
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold bg-stone-900 text-amber-400 border border-amber-500/30 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl">
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Total Reviews
              </span>
              <span className="text-2xl font-black text-stone-900 font-heading mt-1 block">
                {totalReviews}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                Approved & Live
              </span>
              <span className="text-2xl font-black text-emerald-700 font-heading mt-1 block">
                {approvedCount}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                Pending Review
              </span>
              <span className="text-2xl font-black text-amber-700 font-heading mt-1 block">
                {pendingCount}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                Average Rating
              </span>
              <div className="flex items-center space-x-1.5 mt-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-2xl font-black text-stone-900 font-heading">
                  {avgRating} / 5.0
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews by parent, product, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { label: 'All Reviews', value: 'all' },
                { label: 'Approved', value: 'approved' },
                { label: 'Pending', value: 'pending' },
                { label: 'Hidden', value: 'hidden' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterStatus(tab.value as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    filterStatus === tab.value
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-black text-sm text-stone-900">
                        {rev.name}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">({rev.location})</span>
                      <span className="text-[11px] text-stone-400 font-mono">• {rev.date}</span>

                      {rev.status === 'approved' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>APPROVED & LIVE</span>
                        </span>
                      )}
                      {rev.status === 'pending' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                          <span>PENDING MODERATION</span>
                        </span>
                      )}
                      {rev.status === 'hidden' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-800 border border-rose-200 flex items-center space-x-1">
                          <EyeOff className="w-3 h-3 text-rose-600" />
                          <span>HIDDEN</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-stone-200 fill-stone-100'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-stone-700 ml-1">
                        {rev.rating}.0 / 5.0
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed italic">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center space-x-2 pt-1">
                      <Package className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                        Associated Product: {rev.productName}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                    {rev.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rev.id, 'approved')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {rev.status !== 'hidden' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rev.id, 'hidden')}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id, rev.name)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-stone-200/80 text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-stone-400 mx-auto" />
                <h4 className="font-heading font-black text-base text-stone-800">
                  No reviews match your filter
                </h4>
                <p className="text-xs text-stone-500">
                  Try clearing the search query or selecting a different status filter.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
