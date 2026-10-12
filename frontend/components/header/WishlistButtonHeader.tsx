'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';

export function WishlistButtonHeader() {
  const { wishlistCount } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className="relative w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 text-slate-800 hover:text-pink-600 bg-white/75 hover:bg-white/95 rounded-full transition-all border border-white/90 focus:outline-none flex items-center justify-center shadow-sm"
      aria-label="View Wishlist"
    >
      <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
      {wishlistCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
          {wishlistCount}
        </span>
      )}
    </Link>
  );
}
