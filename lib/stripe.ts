import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: 'Free',
    videos_per_month: 5,
    price: 0,
    paypal_plan_id: null,
  },
  PRO: {
    name: 'Pro',
    videos_per_month: 50,
    price: 49,
    paypal_plan_id: process.env.PAYPAL_PRO_PLAN_ID,
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
    videos_per_month: 200,
    price: 199,
    paypal_plan_id: process.env.PAYPAL_BUSINESS_PLAN_ID,
    features: [
      'Up to 200 videos per month',
      'Priority processing',
      'Advanced analytics',
      'Export in all formats',
      'Priority support',
      'Custom branding',
      'Team collaboration'
    ]
  }
};
