'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { CartItemState, useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';

export function CartItem({ item }: { item: CartItemState }) {
  const { updateQuantity, removeFromCart } = useCart();
  const mainImage = item.product.images[0]?.url || '/images/products/organic-onesie.jpg';

  return (
    <div className="flex space-x-4 pb-4 border-b border-stone-100">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
        <Image src={mainImage} alt={item.product.name} fill className="object-cover" />
      </div>

      <div className="flex-1 space-y-1">
        <h4 className="font-serif text-sm font-medium text-stone-900 line-clamp-1">{item.product.name}</h4>
        <p className="text-[11px] text-stone-500">
          {item.variant.color && `Color: ${item.variant.color} `}
          {item.variant.size && `| Size: ${item.variant.size}`}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center border border-stone-200 rounded-full px-2 py-0.5 text-xs">
            <button
              onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
              className="px-1 text-stone-500 hover:text-stone-900 font-bold"
            >
              -
            </button>
            <span className="px-2 font-bold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
              className="px-1 text-stone-500 hover:text-stone-900 font-bold"
            >
              +
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-stone-900">
              {formatCurrency(item.variant.price * item.quantity)}
            </span>
            <button
              onClick={() => removeFromCart(item.variant.id)}
              className="text-stone-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
