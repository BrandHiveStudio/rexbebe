import React from 'react';
import { CreditCard, ShieldCheck, Banknote } from 'lucide-react';

interface PaymentMethodProps {
  selectedMethod: 'PAYHERE' | 'CARD' | 'CASH_ON_DELIVERY';
  onSelect: (method: 'PAYHERE' | 'CARD' | 'CASH_ON_DELIVERY') => void;
}

export function PaymentMethod({ selectedMethod, onSelect }: PaymentMethodProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
      <div className="flex flex-col min-[380px]:flex-row items-start min-[380px]:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <h3 className="font-serif text-xl font-medium text-stone-900">
          2. Select Payment Option
        </h3>
        <span className="flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          <span>256-Bit SSL Encrypted</span>
        </span>
      </div>

      <div className="space-y-3">
        <label
          onClick={() => onSelect('PAYHERE')}
          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
            selectedMethod === 'PAYHERE'
              ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-300'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-brand-600" />
            <div>
              <p className="text-xs font-bold text-stone-900">PayHere Sri Lanka Gateway</p>
              <p className="text-[10px] text-stone-500">Visa, Mastercard, AMEX, eZ Cash, Frimi</p>
            </div>
          </div>
          <input type="radio" checked={selectedMethod === 'PAYHERE'} readOnly />
        </label>

        <label
          onClick={() => onSelect('CASH_ON_DELIVERY')}
          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
            selectedMethod === 'CASH_ON_DELIVERY'
              ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-300'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Banknote className="w-5 h-5 text-stone-600" />
            <div>
              <p className="text-xs font-bold text-stone-900">Cash / Card on Delivery</p>
              <p className="text-[10px] text-stone-500">Pay directly to our concierge courier upon receipt</p>
            </div>
          </div>
          <input type="radio" checked={selectedMethod === 'CASH_ON_DELIVERY'} readOnly />
        </label>
      </div>
    </div>
  );
}
