'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Heart, Truck } from 'lucide-react';

const ANNOUNCEMENTS = [
  { text: 'FREE SHIPPING ON ORDERS OVER LKR 10,000 | EASY RETURNS | SECURE CHECKOUT 🌸', icon: Truck },
  { text: 'NEW SEASON: ATELIER AUTUMN CASHMERE & FRENCH LINEN CAPSULE HAS ARRIVED ✨', icon: Sparkles },
  { text: 'COMPLIMENTARY LUXURY GIFT WRAPPING ON ALL BOUTIQUE ORDERS 🎁', icon: Heart },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  return (
    <div className="relative z-50">
      {/* Top Part of Header - Slightly Darker Version of Theme Colors */}
      <div className="bg-top-pastel-header-darker text-slate-950 text-[11px] font-medium tracking-widest uppercase py-2.5 px-4 relative overflow-hidden select-none border-b border-white/60 shadow-[0_4px_14px_-2px_rgba(0,0,0,0.08),inset_0_-1.5px_3px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)}
            className="hidden md:block p-1 text-slate-800 hover:text-pink-700 transition-colors focus:outline-none"
            aria-label="Previous Announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 flex items-center justify-center space-x-2 text-center transition-all duration-500 ease-in-out">
            <Icon className="w-3.5 h-3.5 text-pink-700 hidden sm:inline-block" />
            <span className="truncate tracking-[0.18em] font-bold text-slate-950">
              {current.text}
            </span>
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)}
            className="hidden md:block p-1 text-slate-800 hover:text-pink-700 transition-colors focus:outline-none"
            aria-label="Next Announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


