'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { CartItem } from './CartItem';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, shippingFee, total } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-purple-950/60 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-pastel-lg flex flex-col justify-between border-l border-purple-100 rounded-l-3xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-tl-3xl">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-purple-950">Your Shopping Bag 🛍</h2>
                  <p className="text-[10px] text-purple-600">{items.length} boutique items</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-purple-400 hover:text-purple-950 rounded-full hover:bg-purple-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-20 h-20 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto shadow-pastel-sm">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <p className="font-heading text-lg font-bold text-purple-950">Your shopping bag is empty 🌸</p>
                  <p className="text-xs text-purple-600 max-w-xs mx-auto">
                    Discover handcrafted organic cashmere rompers and linen swaddles.
                  </p>
                  <button
                    onClick={closeCart}
                    className="text-xs text-purple-700 font-bold uppercase tracking-wider underline pt-2"
                  >
                    Discover New Arrivals ✨
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <CartItem key={item.variant.id} item={item} />
                ))
              )}
            </div>

            {/* Footer Summary & Action Buttons */}
            {items.length > 0 && (
              <div className="p-6 bg-gradient-to-br from-purple-50/80 via-pink-50/50 to-white border-t border-purple-100 space-y-4">
                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between text-purple-800">
                    <span>Subtotal</span>
                    <span className="font-bold text-purple-950">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-purple-800">
                    <span>Complimentary Shipping</span>
                    <span className="font-bold text-emerald-600">
                      {shippingFee === 0 ? 'FREE 🌸' : formatCurrency(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-purple-950 pt-2 border-t border-purple-200/80">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/cart" onClick={closeCart}>
                    <Button variant="secondary" size="md" className="w-full text-[11px] shadow-pastel-sm">
                      VIEW CART 🛍
                    </Button>
                  </Link>

                  <Link href="/checkout" onClick={closeCart}>
                    <Button variant="primary" size="md" className="w-full text-[11px] shadow-pastel-3d">
                      CHECKOUT 🌸
                    </Button>
                  </Link>
                </div>

                <p className="text-[10px] text-center text-purple-500 font-light pt-1">
                  Tax included. Express islandwide shipping applied at checkout.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
