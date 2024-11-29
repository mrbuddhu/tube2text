'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { PLANS, submitPaymentProof } from '@/lib/subscription';
import { useUser } from '@clerk/nextjs';

export function PaymentVerification({ plan }: { plan: keyof typeof PLANS }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planDetails = PLANS[plan];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !screenshot) return;

    setIsSubmitting(true);
    try {
      // Upload screenshot to Supabase Storage
      const filename = `payment-proofs/${user.id}/${Date.now()}-${screenshot.name}`;
      const { data: uploadData, error: uploadError } = await supabaseClient
        .storage
        .from('payment-proofs')
        .upload(filename, screenshot);

      if (uploadError) throw uploadError;

      // Submit payment verification
      await submitPaymentProof(user.id, {
        plan,
        transactionId,
        amount: planDetails.price,
        screenshot: filename
      });

      toast({
        title: 'Payment proof submitted!',
        description: 'We will verify your payment within 24 hours.',
      });

      // Clear form
      setTransactionId('');
      setScreenshot(null);
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: 'Error submitting payment proof',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Submit Payment Proof</h3>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm">
            1. Send <span className="font-bold">${planDetails.price}</span> to our PayPal
          </p>
          <a 
            href={planDetails.paypalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline block mt-2"
          >
            {planDetails.paypalLink}
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction ID
            </label>
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter PayPal transaction ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Screenshot
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Please include the transaction ID in the screenshot
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
          </Button>
        </form>

        <div className="text-sm text-gray-500">
          <p>After submission:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>We will verify your payment within 24 hours</li>
            <li>You&apos;ll receive an email confirmation</li>
            <li>Your plan will be upgraded immediately after verification</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
