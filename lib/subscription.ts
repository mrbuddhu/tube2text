import { supabaseClient } from './supabase';

export const PLANS = {
  FREE: {
    name: 'Free',
    videos_per_month: 5,
    price: 0,
    paypalLink: null,
  },
  PRO: {
    name: 'Pro',
    videos_per_month: 50,
    price: 59.99,
    paypalLink: 'https://paypal.me/mrbuddhu1/59.99',
    features: [
      'Up to 50 videos per month',
      'Priority processing',
      'Advanced analytics',
      'Export in all formats',
      'Email support'
    ]
  },
  BUSINESS: {
    name: 'Business',
    videos_per_month: -1, // unlimited
    price: 179.99,
    paypalLink: 'https://paypal.me/mrbuddhu1/179.99',
    features: [
      'Unlimited videos',
      'Team collaboration',
      'API access',
      'Custom exports',
      'Priority support',
      'Custom branding'
    ]
  }
};

export async function checkSubscription(userId: string) {
  const { data: subscription } = await supabaseClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  return subscription;
}

export async function getRemainingVideos(userId: string) {
  const { data: usage } = await supabaseClient
    .from('usage_stats')
    .select('videos_processed')
    .eq('user_id', userId)
    .single();

  const { data: subscription } = await supabaseClient
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const plan = subscription?.plan || 'FREE';
  const videosProcessed = usage?.videos_processed || 0;
  const limit = PLANS[plan as keyof typeof PLANS].videos_per_month;

  return limit === -1 ? Infinity : Math.max(0, limit - videosProcessed);
}

export async function submitPaymentProof(userId: string, data: {
  plan: string;
  transactionId: string;
  amount: number;
  screenshot: string;
}) {
  return await supabaseClient
    .from('payment_verifications')
    .insert([
      {
        user_id: userId,
        plan: data.plan,
        transaction_id: data.transactionId,
        amount: data.amount,
        screenshot: data.screenshot,
        status: 'pending'
      }
    ]);
}
