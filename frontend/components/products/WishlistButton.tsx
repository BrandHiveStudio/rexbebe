'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { INITIAL_PRODUCTS } from '../../hooks/useCart';

import { useAdminData } from '../../hooks/AdminContext';
import { Product } from '../../types/product';

export function WishlistButton({ productId, product: passedProduct }: { productId: string; product?: Product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { products } = useAdminData();
  const isSaved = isInWishlist(productId);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const product = passedProduct || products.find(p => p.id === productId);
    if (!product) return;
    toggleWishlist(product);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:bg-white text-stone-700 hover:text-rose-500 transition-all focus:outline-none"
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
    </button>
  );
}
