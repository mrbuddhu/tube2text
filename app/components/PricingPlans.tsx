'use client';

import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '#',
    price: { monthly: '$0' },
    description: 'Try out our service with 2 free conversions.',
    features: [
      '2 video conversions total',
      'Basic formatting options',
      'TXT export format',
      '5-minute maximum video length',
      'Basic support',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: 'https://paypal.me/mrbuddhu1/19',
    price: { monthly: '$19' },
    description: 'Ideal for content creators and journalists.',
    features: [
      'Unlimited video conversions',
      'Advanced AI formatting',
      'All export formats (TXT, MD, HTML)',
      '2-hour maximum video length',
      'Priority email support',
      'Cloud storage for conversions',
      'Team sharing features',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: 'https://paypal.me/mrbuddhu1/49',
    price: { monthly: '$49' },
    description: 'For teams and professional use.',
    features: [
      'Everything in Pro plan',
      '4-hour maximum video length',
      'Custom API access',
      'Advanced analytics',
      'Dedicated support',
      'Custom formatting options',
      'White-label exports',
      'Multiple team workspaces',
    ],
    featured: false,
  },
];

export default function PricingPlans() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">Pricing Plans</h1>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Start with our free plan. Upgrade when you need more features.
          </p>
          <p className="mt-2 text-sm text-gray-500 sm:text-center">
            Payments processed securely through PayPal
          </p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-lg shadow-sm divide-y divide-gray-200 ${
                tier.featured ? 'border-2 border-indigo-500' : 'border border-gray-200'
              }`}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6 text-gray-900">{tier.name}</h2>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price.monthly}</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                {tier.name === 'Free' ? (
                  <button
                    className="mt-8 block w-full py-2 px-4 border border-transparent rounded-md text-sm font-semibold text-white text-center bg-gray-800 hover:bg-gray-900"
                  >
                    Start for free
                  </button>
                ) : (
                  <a
                    href={tier.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-8 block w-full py-2 px-4 border border-transparent rounded-md text-sm font-semibold text-white text-center ${
                      tier.featured ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                  >
                    Subscribe with PayPal
                  </a>
                )}
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What&apos;s included
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
