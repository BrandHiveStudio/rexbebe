import React from 'react';

export function DeliveryForm({ values, onChange }: { values: any; onChange: (vals: any) => void }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
      <h3 className="font-serif text-xl font-medium text-stone-900 border-b border-stone-100 pb-3">
        1. Shipping & Delivery Address
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-stone-700 font-semibold mb-1">Full Recipient Name</label>
          <input
            type="text"
            name="recipientName"
            value={values.recipientName}
            onChange={handleChange}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
            required
          />
        </div>
        <div>
          <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-stone-700 font-semibold mb-1">Street Address & Suite</label>
          <input
            type="text"
            name="street"
            value={values.street}
            onChange={handleChange}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
            required
          />
        </div>
        <div>
          <label className="block text-stone-700 font-semibold mb-1">City</label>
          <input
            type="text"
            name="city"
            value={values.city}
            onChange={handleChange}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
            required
          />
        </div>
        <div>
          <label className="block text-stone-700 font-semibold mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
            required
          />
        </div>
      </div>
    </div>
  );
}
