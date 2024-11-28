'use client';

import { useSession } from 'next-auth/react';
import { PaymentService, PlanType } from '@/lib/payment';
import { toast } from 'react-hot-toast';

const tiers = [
  {
    name: 'Free',
    price: '0',
    features: [
      '5 videos per month',
      'Basic transcription',
      'TXT export',
      'YouTube video preview',
    ],
    buttonText: 'Get Started',
    recommended: false
  },
  {
    name: 'Pro',
    price: '9.99',
    features: [
      '50 videos per month',
      'AI-powered enhancement',
      'All export formats',
      'Priority processing',
      'No watermark',
      'Email support'
    ],
    buttonText: 'Upgrade to Pro',
    recommended: true
  },
  {
    name: 'Business',
    price: '29.99',
    features: [
      'Unlimited videos',
      'Advanced AI features',
      'Priority support',
      'Custom branding',
      'API access',
      'Bulk processing'
    ],
    buttonText: 'Contact Sales',
    recommended: false
  }
];

export default function PricingPage() {
  const { data: session } = useSession();

  const handleUpgrade = async (planType: PlanType) => {
    if (!session) {
      toast.error('Please sign in to upgrade your plan');
      return;
    }

    try {
      const paymentLink = PaymentService.getPaymentLink(planType);
      // Open PayPal.me link in a new window
      window.open(paymentLink, '_blank');
      
      toast.success(
        'After completing the payment, please contact support to activate your plan.',
        { duration: 6000 }
      );
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process upgrade request');
    }
  };

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {(Object.keys(PaymentService.plans) as PlanType[]).map((planType) => {
            const plan = PaymentService.getPlan(planType);
            return (
              <div
                key={planType}
                className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-4 text-sm text-gray-500">
                    {plan.name === 'Free' ? 'Start for free' : 'Most popular'}
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {PaymentService.formatPrice(plan.price)}
                    </span>
                    <span className="text-base font-medium text-gray-500">
                      /month
                    </span>
                  </p>
                  <button
                    onClick={() => handleUpgrade(planType)}
                    className={`mt-8 block w-full py-2 px-4 border border-transparent rounded-md text-sm font-semibold text-white text-center ${
                      planType === 'free'
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    disabled={planType === 'free'}
                  >
                    {planType === 'free'
                      ? 'Current Plan'
                      : session
                      ? 'Upgrade Now'
                      : 'Sign in to Upgrade'}
                  </button>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide">
                    What's included
                  </h4>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex space-x-3">
                        <svg
                          className="flex-shrink-0 h-5 w-5 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need a custom plan? {' '}
            <a
              href="mailto:support@tube2text.com"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
