'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface PaymentProof {
  id: string;
  user_id: string;
  plan: string;
  transaction_id: string;
  amount: number;
  screenshot: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export function PaymentVerificationPanel() {
  const [payments, setPayments] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const { data, error } = await supabaseClient
        .from('payment_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error fetching payments',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerification(paymentId: string, verified: boolean) {
    try {
      // Update payment verification status
      const { error: updateError } = await supabaseClient
        .from('payment_verifications')
        .update({
          status: verified ? 'verified' : 'rejected',
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // If verified, update user's subscription
      if (verified) {
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) return;

        const { error: subscriptionError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: payment.user_id,
            plan: payment.plan,
            status: 'active',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          });

        if (subscriptionError) throw subscriptionError;
      }

      toast({
        title: 'Payment ' + (verified ? 'verified' : 'rejected'),
        description: 'The payment has been ' + (verified ? 'verified' : 'rejected') + ' successfully',
      });

      // Refresh payments list
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error updating payment',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payment Verifications</h2>
      
      {payments.length === 0 ? (
        <p className="text-gray-500">No pending payments to verify</p>
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    User ID: {payment.user_id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Plan: {payment.plan}
                  </p>
                  <p className="text-sm text-gray-500">
                    Amount: ${payment.amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    Transaction ID: {payment.transaction_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(payment.created_at).toLocaleString()}
                  </p>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${payment.screenshot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Screenshot
                  </a>
                </div>
                
                {payment.status === 'pending' && (
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleVerification(payment.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Verify
                    </Button>
                    <Button
                      onClick={() => handleVerification(payment.id, false)}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                )}
                
                {payment.status !== 'pending' && (
                  <span className={`px-2 py-1 rounded text-sm ${
                    payment.status === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
