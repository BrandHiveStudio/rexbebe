'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Globe2,
  Search,
  Share2,
  Upload,
  Sparkles,
  Check,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { uploadService } from '../../../services/uploadService';

interface SeoSettingsData {
  metaTitle: string;
  metaDescription: string;
  socialShareImage: string;
  keywords: string;
}

const DEFAULT_SEO: SeoSettingsData = {
  metaTitle: 'REXBEBE | Luxury Organic Baby Clothing & Nursery Boutique',
  metaDescription:
    'Shop handcrafted 100% organic cashmere, French flax linen, and gentle organic cotton clothing for newborn babies and toddlers. Express delivery across Sri Lanka and worldwide.',
  socialShareImage: '/images/products/editorial-baby-lifestyle.jpg',
  keywords: 'baby clothes, organic cashmere baby, baby boy rompers, baby girl dresses, Sri Lanka baby boutique',
};

const STORAGE_KEY = 'rexbebe_admin_seo_settings';

export default function AdminSeoSettingsPage() {
  const [seo, setSeo] = useState<SeoSettingsData>(DEFAULT_SEO);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSeo(JSON.parse(saved));
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seo));
    }
    showToast('Search engine settings saved successfully! 🌸');
  };

  const handleReset = () => {
    if (confirm('Reset search engine details to recommended defaults?')) {
      setSeo(DEFAULT_SEO);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEO));
      }
      showToast('Search engine settings reset to defaults.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      setSeo({ ...seo, socialShareImage: res.url });
      showToast('Social preview image updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="SEO Settings"
          subtitle="Manage search engine information and social media sharing previews."
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

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Simple English Explanation Banner */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 text-sky-800 text-xs font-bold">
              <Globe2 className="w-4 h-4" />
              <span>HOW SEARCH ENGINES FIND YOUR STORE</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
              When parents search for baby clothes on Google or share a link on WhatsApp, Google and
              social apps look at this title, description and photo. Keeping them friendly and
              descriptive helps parents find you easily.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Form (7 cols) */}
            <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
              <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs space-y-4 text-xs font-semibold">
                <h3 className="font-heading font-black text-base text-stone-900 border-b border-stone-100 pb-2">
                  Search Information
                </h3>

                {/* Meta Title */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-700 font-bold block">
                      Store Title on Google <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400">
                      {seo.metaTitle.length}/60 characters recommended
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={seo.metaTitle}
                    onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    The large clickable blue headline displayed on Google search results.
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-700 font-bold block">
                      Store Summary Description
                    </label>
                    <span className="text-[10px] text-stone-400">
                      {seo.metaDescription.length}/160 characters recommended
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={seo.metaDescription}
                    onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-normal leading-relaxed"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    One or two short sentences explaining what baby clothes your store offers.
                  </p>
                </div>

                {/* Social Share Image */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-stone-800 font-bold text-xs block">
                        Social Share Photo (WhatsApp & Facebook)
                      </label>
                      <p className="text-[11px] text-stone-500 font-normal">
                        Displayed when sending your link in chat messages.
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-2xs transition-colors flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                    </button>
                  </div>

                  {seo.socialShareImage && (
                    <div className="h-40 w-full relative rounded-xl overflow-hidden border border-stone-300">
                      <Image
                        src={seo.socialShareImage}
                        alt="Social Share Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md shadow-amber-900/10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Search Settings</span>
              </button>
            </form>

            {/* Right: Interactive Live Previews (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Google Preview Snippet */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs">
                  <Search className="w-4 h-4 text-sky-600" />
                  <span>Google Search Result Preview</span>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-1.5 font-sans">
                  <div className="flex items-center space-x-1.5 text-xs text-stone-500">
                    <span className="w-4 h-4 rounded-full bg-amber-800 text-white text-[9px] font-black flex items-center justify-center">
                      R
                    </span>
                    <span className="text-stone-800 font-medium">https://rexbebe.com</span>
                  </div>
                  <h4 className="text-blue-700 hover:underline font-medium text-sm leading-snug cursor-pointer line-clamp-2">
                    {seo.metaTitle}
                  </h4>
                  <p className="text-stone-600 text-xs line-clamp-3 leading-relaxed">
                    {seo.metaDescription}
                  </p>
                </div>
              </div>

              {/* WhatsApp / Social Card Preview */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp & Social Card Preview</span>
                </div>
                <div className="bg-[#EFEAE2] p-3 rounded-2xl border border-stone-200">
                  <div className="bg-white rounded-xl overflow-hidden shadow-xs border border-stone-200 space-y-2">
                    {seo.socialShareImage && (
                      <div className="h-36 w-full relative bg-stone-100">
                        <Image
                          src={seo.socialShareImage}
                          alt="Social Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3 space-y-1">
                      <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                        rexbebe.com
                      </p>
                      <h4 className="font-bold text-xs text-stone-900 line-clamp-1">
                        {seo.metaTitle}
                      </h4>
                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                        {seo.metaDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
