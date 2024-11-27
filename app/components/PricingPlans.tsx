'use client';

import { CheckIcon } from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '#',
    price: { monthly: '$0' },
    description: 'Get started with basic video transcription.',
    features: [
      '5 videos per month',
      'Basic transcription',
      'TXT download format',
      'Copy to clipboard',
      'Basic support',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: 'https://paypal.me/mrbuddhu1/10',
    price: { monthly: '$10' },
    description: 'Perfect for content creators and professionals.',
    features: [
      'Unlimited videos',
      'High-quality transcription',
      'All download formats (TXT, MD, HTML)',
      'Priority support',
      'No watermark',
      'API access',
      'Custom formatting',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: 'https://paypal.me/mrbuddhu1/49',
    price: { monthly: '$49' },
    description: 'Dedicated support and infrastructure for your team.',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Analytics dashboard',
      'Custom API limits',
      'SLA',
      'Dedicated support',
      'Custom integrations',
      'White-label option',
    ],
    featured: false,
  },
];

export default function PricingPlans() {
  const { data: session } = useSession();

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the perfect plan for your needs
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start with our free plan or upgrade to unlock premium features. Cancel anytime.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                tier.featured
                  ? 'bg-gray-900 ring-gray-900'
                  : 'bg-white'
              } xl:p-10`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  className={`text-lg font-semibold leading-8 ${
                    tier.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.name}
                </h3>
              </div>
              <p className={`mt-4 text-sm leading-6 ${tier.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    tier.featured ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.price.monthly}
                </span>
                <span className={`text-sm font-semibold leading-6 ${tier.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                  /month
                </span>
              </p>
              <a
                href={tier.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? 'bg-white text-gray-900 hover:bg-gray-100 focus-visible:outline-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                }`}
              >
                {session ? 'Upgrade now' : 'Get started'}
              </a>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
