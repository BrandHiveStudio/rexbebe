'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../hooks/useCart';
import { DeliveryForm } from './DeliveryForm';
import { PaymentMethod } from './PaymentMethod';
import { OrderSummary } from './OrderSummary';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { Button } from '../ui/Button';

export function CheckoutForm() {
  const router = useRouter();
  const { items, total, subtotal, shippingFee, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<'PAYHERE' | 'CARD' | 'CASH_ON_DELIVERY'>('PAYHERE');

  const [deliveryInfo, setDeliveryInfo] = useState({
    recipientName: 'Elena Rostova',
    street: '45 Park Avenue, Suite 12',
    city: 'Colombo',
    state: 'Western Province',
    postalCode: '00700',
    country: 'Sri Lanka',
    email: 'elena@example.com',
    phone: '+94 77 123 4567',
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create order in Backend via REST API (Server validates stock & prices)
      const newOrder = await orderService.createOrder({
        customerId: 'cust-1',
        customerName: deliveryInfo.recipientName,
        customerEmail: deliveryInfo.email,
        items: items.map(item => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        shippingAddress: deliveryInfo,
        paymentMethod: paymentType,
      });

      // 2. If PayHere selected, request secure payment session signature from Backend
      if (paymentType === 'PAYHERE') {
        const paySession = await paymentService.createPaymentSession(newOrder.orderNumber, newOrder.totalAmount);
        console.log('[PayHere Gateway Session Initialized]', paySession);
      }

      clearCart();
      router.push(`/order/${newOrder.orderNumber}`);
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7 space-y-8">
        <DeliveryForm values={deliveryInfo} onChange={setDeliveryInfo} />
        <PaymentMethod selectedMethod={paymentType} onSelect={setPaymentType} />
      </div>

      <div className="lg:col-span-5 space-y-6">
        <OrderSummary items={items} subtotal={subtotal} shippingFee={shippingFee} total={total} />
        <Button variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Processing Secure Order...' : 'Complete & Pay Order'}
        </Button>
      </div>
    </form>
  );
}
