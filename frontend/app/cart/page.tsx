'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useCart } from '../../hooks/useCart';
import { CartItem } from '../../components/cart/CartItem';
import { CartSummary } from '../../components/cart/CartSummary';
import { Button } from '../../components/ui/Button';

export default function CartPage() {
  const { items, clearCart } = useCart();

  return (
    <>
      <Header />
      <main className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[60vh]">
        <h1 className="font-serif text-3xl font-normal text-stone-900 mb-8">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
            <p className="font-serif text-xl text-stone-700">Your shopping bag is currently empty.</p>
            <Link href="/shop" className="inline-block mt-4">
              <Button variant="primary">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-4">
              {items.map(item => (
                <CartItem key={item.variant.id} item={item} />
              ))}
              <div className="pt-4 flex justify-end">
                <button onClick={clearCart} className="text-xs text-rose-600 font-semibold uppercase tracking-wider">
                  Clear Shopping Bag
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <CartSummary />
              <Link href="/checkout" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
