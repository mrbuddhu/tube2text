'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

declare global {
  interface Window {
    paypal?: any;
  }
}

const EARLY_BIRD_PRICE = 249;

interface PayPalButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function PayPalButton({ onSuccess, onError }: PayPalButtonProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (window.paypal) {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (_: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: 'Tube2Text Lifetime Access',
              amount: {
                currency_code: 'USD',
                value: EARLY_BIRD_PRICE.toString()
              }
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },
        onApprove: async (_: any, actions: any) => {
          try {
            const order = await actions.order.capture();
            
            // Save order details to user's account
            const response = await fetch('/api/payment/confirm', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: order.id,
                userEmail: user?.email,
                amount: EARLY_BIRD_PRICE,
                paypalEmail: order.payer.email_address
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to confirm payment');
            }

            toast.success('Payment successful! Welcome to Tube2Text!');
            onSuccess?.();
          } catch (error) {
            console.error('Payment confirmation error:', error);
            toast.error('There was an issue confirming your payment. Please contact support.');
            onError?.(error);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          toast.error('Payment failed. Please try again.');
          onError?.(err);
        }
      }).render('#paypal-button-container');
    }
  }, [user, onSuccess, onError]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="paypal-button-container" className="mt-4" />
      <p className="text-xs text-gray-500 text-center mt-2">
        Secure payment processed by PayPal
      </p>
    </div>
  );
}
