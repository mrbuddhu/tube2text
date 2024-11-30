'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { useToast } from './ui/use-toast';

const tiers = [
  {
    name: 'Basic',
    id: 'basic',
    priceMonthly: '$9',
    description: 'Perfect for individuals and small projects.',
    features: [
      '10 video conversions per month',
      'Up to 30 minutes per video',
      'Basic formatting options',
      'TXT and MD export formats',
      'Email support',
    ],
    credits: 10,
    featured: false,
    paypalAmount: '9.00'
  },
  {
    name: 'Pro',
    id: 'pro',
    priceMonthly: '$29',
    description: 'Ideal for content creators and small teams.',
    features: [
      'Unlimited video conversions',
      'Up to 2 hours per video',
      'Advanced AI formatting',
      'All export formats',
      'Priority support',
      'Team sharing',
      'API access',
    ],
    credits: 50,
    featured: true,
    paypalAmount: '29.00'
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    priceMonthly: 'Custom',
    description: 'For organizations with advanced needs.',
    features: [
      'Custom video length limits',
      'Custom AI model training',
      'White-label option',
      'Advanced analytics',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    credits: 200,
    featured: false,
    paypalAmount: '99.00'
  },
];

const PAYPAL_ME_LINK = 'https://paypal.me/mrbuddhu1';

export const Pricing: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (tier: typeof tiers[0]) => {
    if (!isSignedIn) {
      addToast({
        title: 'Sign in required',
        description: 'Please sign in to purchase credits',
        variant: 'destructive',
      });
      return;
    }

    // Open PayPal.me link in new tab
    window.open(`${PAYPAL_ME_LINK}/${tier.paypalAmount}USD`, '_blank');

    // Show instructions toast
    addToast({
      title: 'Payment Instructions',
      description: 'After completing the payment, please email your transaction ID to contact@sanganak.org to receive your credits.',
      variant: 'default',
      duration: 10000, // Show for 10 seconds
    });
  };

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the perfect plan for your needs
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start with our free trial. Upgrade or cancel anytime.
        </p>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                tier.featured
                  ? 'bg-gray-900 ring-gray-900 lg:order-none lg:mt-0'
                  : 'bg-white lg:mt-0'
              }`}
            >
              <h3
                className={`text-lg font-semibold leading-8 ${
                  tier.featured ? 'text-white' : 'text-gray-900'
                }`}
              >
                {tier.name}
              </h3>
              <p
                className={`mt-4 text-sm leading-6 ${
                  tier.featured ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    tier.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.priceMonthly}
                </span>
              </p>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 ${
                  tier.featured ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className={`h-6 w-5 flex-none ${
                        tier.featured ? 'text-white' : 'text-indigo-600'
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(tier)}
                disabled={loading === tier.id}
                className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? 'bg-white text-gray-900 hover:bg-gray-100 focus-visible:outline-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                } ${loading === tier.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === tier.id ? 'Processing...' : tier.name === 'Enterprise' ? 'Contact Sales' : 'Purchase Credits'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">Payment Instructions</h3>
          <p className="mt-2 text-sm text-gray-600">
            1. Click "Purchase Credits" to open PayPal payment page<br/>
            2. Complete the payment using PayPal<br/>
            3. Copy your PayPal transaction ID<br/>
            4. Email your transaction ID to <a href="mailto:contact@sanganak.org" className="text-indigo-600 hover:text-indigo-500">contact@sanganak.org</a><br/>
            5. Start processing your videos once credits are added!
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Credits will be added to your account within 24 hours of payment verification.
          </p>
        </div>
      </div>
    </section>
  );
};
