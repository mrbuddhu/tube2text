'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  paypal_transaction_id: string;
  credits: number;
  status: string;
  created_at: string;
  user_email: string;
}

const CREDIT_TIERS = {
  '9.00': 10,    // Basic
  '29.00': 50,   // Pro
  '99.00': 200,  // Enterprise
};

export const PaymentVerification = () => {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          users (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedPayments = data?.map(payment => ({
        ...payment,
        user_email: payment.users?.email || 'Unknown',
      })) || [];
      
      setPayments(formattedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      addToast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (payment: Payment) => {
    try {
      // Start a transaction
      const { error: updateError } = await supabase.rpc('verify_payment', {
        p_payment_id: payment.id,
        p_user_id: payment.user_id,
        p_credits: CREDIT_TIERS[payment.amount as keyof typeof CREDIT_TIERS] || 0,
      });

      if (updateError) throw updateError;

      addToast({
        title: 'Success',
        description: `Verified payment and added ${payment.credits} credits to user`,
        variant: 'default',
      });

      fetchPayments();
    } catch (error) {
      console.error('Error verifying payment:', error);
      addToast({
        title: 'Error',
        description: 'Failed to verify payment',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="space-y-1">
                <p className="font-medium">User: {payment.user_email}</p>
                <p className="text-sm text-gray-500">
                  Amount: ${payment.amount}
                </p>
                <p className="text-sm text-gray-500">
                  PayPal Transaction: {payment.paypal_transaction_id}
                </p>
                <p className="text-sm text-gray-500">
                  Credits: {CREDIT_TIERS[payment.amount as keyof typeof CREDIT_TIERS] || 0}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(payment.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    payment.status === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {payment.status}
                </span>
                {payment.status !== 'verified' && (
                  <button
                    onClick={() => verifyPayment(payment)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Verify & Add Credits
                  </button>
                )}
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <p className="text-center text-gray-500">No payments to verify</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
