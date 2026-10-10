'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { ProductGrid } from '../../components/products/ProductGrid';
import { useWishlist } from '../../hooks/useWishlist';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function SavedWishlistPage() {
  const { wishlistItems, wishlistCount } = useWishlist();

  return (
    <>
      <Header />
      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">My Saved Wishlist</h1>
          <p className="text-xs text-stone-500 font-light mt-2">
            You have {wishlistCount} luxury piece{wishlistCount === 1 ? '' : 's'} saved in your boutique wishlist.
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200/80 max-w-md mx-auto space-y-4">
            <p className="font-serif text-lg text-stone-800">Your wishlist is currently empty</p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Save your favorite cashmere rompers, swaddles, and nursery items by clicking the heart icon.
            </p>
            <Link href="/shop" className="inline-block pt-2">
              <Button variant="primary" size="md">
                <span>Explore Boutique Shop</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <ProductGrid products={wishlistItems} />
        )}
      </main>
      <Footer />
    </>
  );
}
