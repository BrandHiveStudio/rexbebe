import React from 'react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';

export function CartSummary() {
  const { subtotal, shippingFee, total } = useCart();

  return (
    <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100 space-y-4">
      <h3 className="font-serif text-lg font-medium text-stone-900">Order Summary</h3>
      
      <div className="space-y-2 text-xs text-stone-600">
        <div className="flex justify-between">
          <span>Items Subtotal</span>
          <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Shipping</span>
          <span className="font-semibold text-stone-900">
            {shippingFee === 0 ? 'Complimentary' : formatCurrency(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold text-stone-900 pt-3 border-t border-brand-200">
          <span>Total (LKR)</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
