import React from 'react';
import Image from 'next/image';
import { CartItemState } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';

export function OrderSummary({
  items,
  subtotal,
  shippingFee,
  total,
}: {
  items: CartItemState[];
  subtotal: number;
  shippingFee: number;
  total: number;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
      <h3 className="font-serif text-xl font-medium text-stone-900 border-b border-stone-100 pb-3">
        3. Order Review ({items.length} items)
      </h3>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={item.variant.id} className="flex items-center space-x-3 text-xs">
            <div className="relative w-12 h-12 rounded-lg bg-stone-100 flex-shrink-0 overflow-hidden">
              <Image
                src={item.product.images[0]?.url || '/images/products/organic-onesie.jpg'}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-900 line-clamp-1">{item.product.name}</p>
              <p className="text-[10px] text-stone-500">Qty: {item.quantity}</p>
            </div>
            <span className="font-bold text-stone-900">
              {formatCurrency(item.variant.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-xs pt-3 border-t border-stone-100 text-stone-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span className="font-semibold text-emerald-700">
            {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
          <span>Grand Total</span>
          <span className="text-brand-700">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
