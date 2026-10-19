'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { CartItemState, useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';

export function CartItem({ item }: { item: CartItemState }) {
  const { updateQuantity, removeFromCart } = useCart();
  const itemImage = item.variant.imageUrl || item.product.images[0]?.url || '/images/products/organic-onesie.jpg';

  return (
    <div className="flex space-x-4 pb-4 border-b border-stone-100">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
        <Image src={itemImage} alt={item.product.name} fill className="object-cover" />
      </div>

      <div className="flex-1 space-y-1">
        <h4 className="font-serif text-sm font-medium text-stone-900 line-clamp-1">
          {item.variant.partName ? `${item.product.name} (${item.variant.partName})` : item.product.name}
        </h4>
        <p className="text-[11px] text-stone-500">
          {item.variant.partName && (
            <span className="font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded text-[10px] mr-1.5 border border-pink-100">
              {item.variant.partName}
            </span>
          )}
          {item.variant.color && `Color: ${item.variant.color} `}
          {item.variant.size && `| Size: ${item.variant.size}`}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center border border-stone-200 rounded-full px-2 py-0.5 text-xs">
            <button
              onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 font-bold"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-2 font-bold min-w-5 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 font-bold"
              aria-label="Increase quantity"
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
              className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
