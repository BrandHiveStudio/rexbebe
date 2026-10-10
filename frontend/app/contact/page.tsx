'use client';

import React from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Personal Assistance</span>
          <h1 className="font-serif text-4xl text-stone-900 font-normal mt-1">Contact Concierge</h1>
          <p className="text-xs text-stone-500 font-light mt-2">
            Our luxury nursery consultants are available for personal styling and gift assistance.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="bg-white p-8 rounded-2xl border border-stone-200 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Your Full Name</label>
              <input type="text" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-600" />
            </div>
            <div>
              <label className="block text-stone-700 font-bold mb-1">Email Address</label>
              <input type="email" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-600" />
            </div>
          </div>
          <div>
            <label className="block text-stone-700 font-bold mb-1">Inquiry Topic</label>
            <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-600">
              <option>Personal Styling Consultation</option>
              <option>Boutique Order Support</option>
              <option>Custom Nursery Design Request</option>
            </select>
          </div>
          <div>
            <label className="block text-stone-700 font-bold mb-1">Your Message</label>
            <textarea rows={5} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-600"></textarea>
          </div>
          <Button variant="primary" size="lg" className="w-full">
            Submit Message to Concierge
          </Button>
        </form>
      </main>
      <Footer />
    </>
  );
}
