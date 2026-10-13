'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { uploadService } from '../../../services/uploadService';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  category: 'products' | 'banners' | 'general';
  uploadedAt: string;
}

const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'med-1',
    name: 'organic-onesie.jpg',
    url: '/images/products/organic-onesie.jpg',
    size: '420 KB',
    category: 'products',
    uploadedAt: 'Brand Asset',
  },
  {
    id: 'med-2',
    name: 'baby-girl-fashion.jpg',
    url: '/images/products/baby-girl-fashion.jpg',
    size: '560 KB',
    category: 'products',
    uploadedAt: 'Brand Asset',
  },
  {
    id: 'med-3',
    name: 'baby-boy-fashion.jpg',
    url: '/images/products/baby-boy-fashion.jpg',
    size: '610 KB',
    category: 'products',
    uploadedAt: 'Brand Asset',
  },
  {
    id: 'med-4',
    name: 'wooden-gym.jpg',
    url: '/images/products/wooden-gym.jpg',
    size: '480 KB',
    category: 'products',
    uploadedAt: 'Brand Asset',
  },
  {
    id: 'med-5',
    name: 'editorial-baby-lifestyle.jpg',
    url: '/images/products/editorial-baby-lifestyle.jpg',
    size: '890 KB',
    category: 'banners',
    uploadedAt: 'Brand Asset',
  },
  {
    id: 'med-6',
    name: 'baby-boy-adventure.jpg',
    url: '/images/products/baby-boy-adventure.jpg',
    size: '510 KB',
    category: 'products',
    uploadedAt: 'Brand Asset',
  },
];

const STORAGE_KEY = 'rexbebe_admin_media_library';

export default function AdminMediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(DEFAULT_MEDIA_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'banners'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMediaList(JSON.parse(saved));
      }
    } catch {
      // Use defaults
    }
  }, []);

  const saveMediaList = (items: MediaItem[]) => {
    setMediaList(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const newItems: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadService.uploadImage(file);
        const item: MediaItem = {
          id: `med-${Date.now()}-${i}`,
          name: res.filename,
          url: res.url,
          size: `${Math.round(file.size / 1024)} KB`,
          category: file.name.includes('banner') ? 'banners' : 'products',
          uploadedAt: 'Just now',
        };
        newItems.unshift(item);
      }

      const updated = [...newItems, ...mediaList];
      saveMediaList(updated);
      showToast(`${files.length} image(s) uploaded successfully! 📸`);
    } catch (err: any) {
      showToast(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyLink = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    showToast('Image link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove image "${name}" from media library?`)) {
      const updated = mediaList.filter((m) => m.id !== id);
      saveMediaList(updated);
      showToast('Image removed from library.');
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.url.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (activeFilter === 'all') return true;
    return m.category === activeFilter;
  });

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Media Library"
          subtitle="Find and reuse uploaded images for your categories, pages and products. Upload new pictures anytime from your computer."
          actions={
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md shadow-amber-900/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading Photos...' : 'Upload Images'}</span>
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
          {/* Drag & Drop Upload Zone (Section 10) */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-amber-300/80 hover:border-amber-500 bg-amber-50/30 hover:bg-amber-50/60 transition-all rounded-3xl p-8 sm:p-10 text-center cursor-pointer space-y-3 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-black text-base text-stone-900">
                Upload Product & Category Images
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Choose images from your computer or drag and drop files here. Supports JPEG, PNG,
                WebP, and SVG files up to 8MB.
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-white text-stone-800 font-bold text-xs border border-stone-200 shadow-2xs group-hover:bg-amber-800 group-hover:text-white transition-colors"
            >
              Browse Computer
            </button>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {[
                { id: 'all', label: `All Images (${mediaList.length})` },
                { id: 'products', label: 'Product Photos' },
                { id: 'banners', label: 'Page Banners' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === f.id
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-stone-200/80 text-center space-y-2 text-stone-400">
                <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                <p className="font-bold text-xs">No images found</p>
              </div>
            ) : (
              filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="h-36 w-full relative bg-stone-100">
                    <Image
                      src={item.url}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="space-y-0.5">
                      <p className="font-bold text-stone-900 text-xs truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-stone-400">{item.size}</p>
                    </div>

                    <div className="pt-1 border-t border-stone-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all ${
                          copiedId === item.id
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                        title="Copy image URL to use in products or categories"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <Copy className="w-3 h-3 text-stone-500" />
                        )}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy Link'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
