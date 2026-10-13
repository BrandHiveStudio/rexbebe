'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Edit2,
  Eye,
  Check,
  Upload,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Globe2,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { uploadService } from '../../../services/uploadService';

interface WebsitePageData {
  id: string;
  name: string;
  slug: string;
  url: string;
  heading: string;
  shortDescription: string;
  detailedDescription: string;
  bannerImage: string;
  additionalImages?: string[];
  status: 'published' | 'draft';
  isVisible: boolean;
  seoTitle: string;
  seoDescription: string;
  lastUpdated: string;
}

const DEFAULT_PAGES: WebsitePageData[] = [
  {
    id: 'page-about',
    name: 'About Us',
    slug: 'about',
    url: '/about',
    heading: 'The REXBEBE Heritage & Atelier Story',
    shortDescription: 'Dedicated to the softest beginnings and timeless heirloom craftsmanship.',
    detailedDescription:
      'Founded with a heartfelt promise to tender baby skin, REXBEBE crafts heirloom clothing from certified organic Mongolian cashmere, French flax linen, and GOTS-certified Aegean cotton. Every garment is carefully hand-finished to ensure zero rough seams, non-toxic vegetable dyes, and pure cloud-like comfort for your little explorer.',
    bannerImage: '/images/products/editorial-baby-lifestyle.jpg',
    status: 'published',
    isVisible: true,
    seoTitle: 'About REXBEBE | Handcrafted Luxury Organic Baby Clothing',
    seoDescription:
      'Learn about REXBEBE story. We create heirloom cashmere, organic cotton and French linen babywear with gentle European craftsmanship.',
    lastUpdated: 'Today',
  },
  {
    id: 'page-shipping',
    name: 'Shipping & Delivery',
    slug: 'shipping',
    url: '/shipping',
    heading: 'Complimentary Boutique Delivery & Care',
    shortDescription: 'Fast, secure doorstep delivery wrapped in tissue paper and luxury ribbon.',
    detailedDescription:
      'We offer complimentary courier delivery across Sri Lanka on all orders over LKR 10,000. Island-wide orders are dispatched within 24–48 hours in our signature gift box. International express shipping is available worldwide with end-to-end parcel tracking.',
    bannerImage: '/images/products/baby-girl-fashion.jpg',
    status: 'published',
    isVisible: true,
    seoTitle: 'Shipping & Delivery Information | REXBEBE',
    seoDescription:
      'Island-wide courier delivery and worldwide express shipping options for REXBEBE baby clothing and nursery gifts.',
    lastUpdated: 'Yesterday',
  },
  {
    id: 'page-returns',
    name: 'Returns & Exchanges',
    slug: 'returns',
    url: '/returns',
    heading: '30-Day Hassle-Free Babywear Exchanges',
    shortDescription: 'Because baby sizes change fast, our exchange policy is smooth and friendly.',
    detailedDescription:
      'We understand that babies grow quickly! We happily offer 30-day unworn exchanges on all standard items. Simply contact our concierge team and we will arrange a convenient courier pickup from your home.',
    bannerImage: '/images/products/organic-onesie.jpg',
    status: 'published',
    isVisible: true,
    seoTitle: 'Returns & 30-Day Exchanges | REXBEBE',
    seoDescription:
      'Easy 30-day baby clothing exchanges and returns. Enjoy stress-free boutique shopping at REXBEBE.',
    lastUpdated: '3 days ago',
  },
  {
    id: 'page-size-guide',
    name: 'Size Guide',
    slug: 'size-guide',
    url: '/size-guide',
    heading: 'Baby & Toddler Measurement Guide',
    shortDescription: 'Find the perfect snug and comfortable fit for Newborn up to 6 Years.',
    detailedDescription:
      'Our babywear is designed with gentle stretch and room for growth diapers. If your little one is in between sizes, we recommend selecting the next size up for longer wear and comfort.',
    bannerImage: '/images/products/baby-boy-fashion.jpg',
    status: 'published',
    isVisible: true,
    seoTitle: 'Baby Clothing Size Guide (0M - 6Y) | REXBEBE',
    seoDescription:
      'Find the perfect fit for newborn, infant, and toddler clothing with the comprehensive REXBEBE size chart.',
    lastUpdated: '1 week ago',
  },
  {
    id: 'page-contact',
    name: 'Contact Us',
    slug: 'contact',
    url: '/contact',
    heading: 'Boutique Concierge & Customer Care',
    shortDescription: 'Our friendly team is here to assist with sizing, gifting, and order updates.',
    detailedDescription:
      'Have a question about a fabric, custom gift basket, or delivery? Reach our Colombo atelier concierge via WhatsApp (+94 77 123 4567) or email care@rexbebe.com. We respond within a few hours.',
    bannerImage: '/images/products/wooden-gym.jpg',
    status: 'published',
    isVisible: true,
    seoTitle: 'Contact Customer Concierge | REXBEBE Baby Boutique',
    seoDescription:
      'Get in touch with REXBEBE customer concierge. Inquire about bespoke baby gifts, order tracking, and custom orders.',
    lastUpdated: '2 weeks ago',
  },
  {
    id: 'page-faq',
    name: 'Frequently Asked Questions (FAQ)',
    slug: 'faq',
    url: '/faq',
    heading: 'Help & Frequently Asked Questions',
    shortDescription: 'Quick answers about baby fabrics, washing care, orders, and gift boxes.',
    detailedDescription:
      'Find answers to common parenting questions regarding organic washing instructions, payment methods, delivery times, and luxury gift wrapping.',
    bannerImage: '/images/products/organic-onesie.jpg',
    status: 'published',
    isVisible: true,
    seoTitle: 'Frequently Asked Questions (FAQ) | REXBEBE',
    seoDescription:
      'Common questions about REXBEBE organic baby garments, washing instructions, and boutique delivery.',
    lastUpdated: '1 month ago',
  },
];

const STORAGE_KEY = 'rexbebe_admin_website_pages';

export default function AdminWebsitePagesPage() {
  const [pages, setPages] = useState<WebsitePageData[]>(DEFAULT_PAGES);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<WebsitePageData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved pages from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPages(JSON.parse(saved));
      }
    } catch {
      // Use defaults
    }
  }, []);

  const savePagesToStorage = (updated: WebsitePageData[]) => {
    setPages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEdit = (page: WebsitePageData) => {
    setEditingPage({ ...page });
    setIsEditing(true);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPage) return;
    setIsUploadingBanner(true);
    try {
      const res = await uploadService.uploadImage(file);
      setEditingPage({ ...editingPage, bannerImage: res.url });
      showToast('Banner image uploaded successfully!');
    } catch (err: any) {
      showToast(err.message || 'Could not upload image');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSavePage = (status: 'published' | 'draft') => {
    if (!editingPage) return;
    if (!editingPage.heading.trim()) {
      showToast('Please enter a Main Heading for this page');
      return;
    }

    const updatedPage: WebsitePageData = {
      ...editingPage,
      status,
      isVisible: status === 'published',
      lastUpdated: 'Just now',
    };

    const updatedList = pages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
    savePagesToStorage(updatedList);
    setIsEditing(false);
    showToast(status === 'published' ? 'Page published successfully! 🌸' : 'Page draft saved!');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all website pages to initial boutique descriptions?')) {
      savePagesToStorage(DEFAULT_PAGES);
      showToast('Website pages reset to defaults! 🌸');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Website Pages"
          subtitle="Edit the text and images customers see on your website."
          actions={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetDefaults}
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

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Introduction Card */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold">
              <FileText className="w-4 h-4" />
              <span>INFORMATIONAL STOREFRONT PAGES</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Customers read these pages to learn about your boutique heritage, delivery speeds,
              sizing advice and customer care. Click <strong>Edit Page</strong> on any card to update its
              text or banner photo.
            </p>
          </div>

          {/* List of Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pages.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image Preview */}
                  <div className="h-40 w-full relative bg-stone-100 overflow-hidden">
                    <Image
                      src={p.bannerImage || '/images/products/organic-onesie.jpg'}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs ${
                          p.status === 'published'
                            ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100/90 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {p.status === 'published' ? '● Published Live' : '● Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-black text-base text-stone-900">{p.name}</h3>
                      <Link
                        href={p.url}
                        target="_blank"
                        className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center space-x-1"
                        title="View page on website"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <p className="text-xs font-bold text-stone-800 line-clamp-1">{p.heading}</p>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {p.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                  <span className="text-[10px] text-stone-400">Updated: {p.lastUpdated}</span>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-2xs transition-colors flex items-center space-x-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Page</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Page Edit Drawer */}
      {isEditing && editingPage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slideLeft overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Editing Website Page
                </span>
                <h3 className="text-lg font-heading font-black text-stone-900">
                  {editingPage.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold">
              {/* Page Name */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Page Name</label>
                <input
                  type="text"
                  value={editingPage.name}
                  onChange={(e) => setEditingPage({ ...editingPage, name: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <p className="text-[11px] text-stone-500 font-normal">
                  The label displayed in headers, footers and breadcrumbs.
                </p>
              </div>

              {/* Main Heading */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">
                  Main Heading <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingPage.heading}
                  onChange={(e) => setEditingPage({ ...editingPage, heading: e.target.value })}
                  placeholder="e.g. The REXBEBE Heritage & Atelier Story"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                />
                <p className="text-[11px] text-stone-500 font-normal">
                  The large title customers see at the very top of this page.
                </p>
              </div>

              {/* Short Description */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Short Description</label>
                <input
                  type="text"
                  value={editingPage.shortDescription}
                  onChange={(e) => setEditingPage({ ...editingPage, shortDescription: e.target.value })}
                  placeholder="e.g. Dedicated to the softest beginnings and timeless heirloom craftsmanship."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <p className="text-[11px] text-stone-500 font-normal">
                  One friendly summary sentence shown below the main heading.
                </p>
              </div>

              {/* Banner Image */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-stone-800 font-bold text-xs block">
                      Banner Image
                    </label>
                    <p className="text-[11px] text-stone-500 font-normal">
                      Upload a photo that represents this page.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                  <button
                    type="button"
                    disabled={isUploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-2xs transition-colors flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                </div>

                {editingPage.bannerImage && (
                  <div className="h-40 w-full relative rounded-xl overflow-hidden border border-stone-300">
                    <Image
                      src={editingPage.bannerImage}
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Detailed Description */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Detailed Description</label>
                <textarea
                  rows={6}
                  value={editingPage.detailedDescription}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, detailedDescription: e.target.value })
                  }
                  placeholder="Write the full content customers will read on this page..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-relaxed font-normal"
                />
                <p className="text-[11px] text-stone-500 font-normal">
                  Use everyday English. You do not need to write HTML or code.
                </p>
              </div>

              {/* SEO Title & Description */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center space-x-2 text-stone-800 font-bold">
                  <Globe2 className="w-4 h-4 text-sky-600" />
                  <span>Search Engine Information (Google & WhatsApp)</span>
                </div>
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">SEO Page Title</label>
                  <input
                    type="text"
                    value={editingPage.seoTitle}
                    onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={editingPage.seoDescription}
                    onChange={(e) =>
                      setEditingPage({ ...editingPage, seoDescription: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-normal"
                  />
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-stone-100 bg-[#FAF9F6] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-stone-600" />
                <span>Preview Page</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePage('draft')}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePage('published')}
                  className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Page</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Live Preview Modal */}
      {isPreviewOpen && editingPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-300">
            {/* Preview Toolbar */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold">
                  Previewing: {editingPage.name} ({editingPage.url})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    previewDevice === 'desktop' ? 'bg-amber-700 text-white' : 'text-stone-400'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    previewDevice === 'mobile' ? 'bg-amber-700 text-white' : 'text-stone-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="ml-4 text-stone-400 hover:text-white font-bold"
                >
                  ✕ Close Preview
                </button>
              </div>
            </div>

            {/* Preview Screen */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#FAF9F6]">
              <div
                className={`mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden transition-all ${
                  previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-3xl'
                }`}
              >
                {/* Banner */}
                {editingPage.bannerImage && (
                  <div className="h-56 relative w-full bg-stone-100">
                    <Image
                      src={editingPage.bannerImage}
                      alt={editingPage.heading}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                      REXBEBE BOUTIQUE
                    </span>
                    <h1 className="text-xl sm:text-2xl font-heading font-black text-stone-900">
                      {editingPage.heading}
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 font-medium">
                      {editingPage.shortDescription}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
                    <p>{editingPage.detailedDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
