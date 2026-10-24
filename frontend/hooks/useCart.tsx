'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Product, ProductVariant } from '../types/product';

export interface CartItemState {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartItemState[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

import { INITIAL_PRODUCTS } from '../data/products';
export { INITIAL_PRODUCTS };


export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemState[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.variant.id === variant.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }
      return [...prev, { product, variant, quantity }];
    });
    openCart();
  };

  const removeFromCart = (variantId: string) => {
    setItems(prev => prev.filter(item => item.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setItems(prev =>
      prev.map(item => (item.variant.id === variantId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const shippingFee = subtotal > 50000 || subtotal === 0 ? 0 : 1500;
  const total = subtotal + shippingFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shippingFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
