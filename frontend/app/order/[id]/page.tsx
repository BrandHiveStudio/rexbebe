'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { CheckCircle, Package, Truck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <main className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>

        <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Order Confirmed</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
          Thank You for Shopping with REXBEBE
        </h1>
        <p className="text-stone-600 text-sm font-light leading-relaxed max-w-lg mx-auto">
          Your order <span className="font-bold text-stone-900">#{params.id}</span> has been received and verified by our backend server. A confirmation dispatch note has been sent to your email.
        </p>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 text-left space-y-4 max-w-md mx-auto text-xs">
          <div className="flex items-center space-x-3 text-stone-700">
            <Package className="w-5 h-5 text-brand-600" />
            <div>
              <p className="font-bold">Order Status: PROCESSING</p>
              <p className="text-stone-500 text-[10px]">Fulfillment team preparing luxury packaging</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-stone-700 pt-3 border-t border-stone-100">
            <Truck className="w-5 h-5 text-brand-600" />
            <div>
              <p className="font-bold">Estimated Delivery: 1 - 2 Business Days</p>
              <p className="text-stone-500 text-[10px]">Insured Courier Express Delivery</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Link href="/shop">
            <Button variant="primary">Return to Storefront</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
