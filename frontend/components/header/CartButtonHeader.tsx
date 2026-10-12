'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export function CartButtonHeader() {
  const { openCart, itemCount } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 text-slate-800 hover:text-sky-600 bg-white/75 hover:bg-white/95 rounded-full transition-all border border-white/90 focus:outline-none flex items-center justify-center shadow-sm"
      aria-label={`Shopping Cart (${itemCount} items)`}
    >
      <ShoppingBag className="w-4 h-4 text-slate-800" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
          {itemCount}
        </span>
      )}
    </button>
  );
}
