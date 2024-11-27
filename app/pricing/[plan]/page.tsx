'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const PAYPAL_LINKS = {
  basic: 'https://paypal.me/mrbuddhu1/9',
  pro: 'https://paypal.me/mrbuddhu1/29'
};

export default function PricingPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const plan = params.plan as string;

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handlePayment = () => {
    const paypalLink = PAYPAL_LINKS[plan as keyof typeof PAYPAL_LINKS];
    if (paypalLink) {
      window.open(paypalLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {plan === 'basic' ? 'Basic Plan' : 'Pro Plan'} Checkout
        </h1>
        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            You are about to subscribe to the {plan === 'basic' ? 'Basic' : 'Pro'} plan:
          </p>
          <ul className="list-disc list-inside text-gray-600">
            <li>{plan === 'basic' ? '30 videos per month' : 'Unlimited videos'}</li>
            <li>{plan === 'basic' ? 'Basic formatting' : 'Advanced AI formatting'}</li>
            <li>{plan === 'basic' ? 'Text & HTML export' : 'Multiple export formats'}</li>
            <li>{plan === 'basic' ? 'Email support' : 'Priority support'}</li>
            {plan === 'pro' && <li>Team collaboration</li>}
          </ul>
          <p className="mt-4 font-semibold text-lg">
            Price: ${plan === 'basic' ? '9' : '29'}/month
          </p>
        </div>
        <button
          onClick={handlePayment}
          className="w-full bg-blue-500 text-white rounded-md py-3 px-4 hover:bg-blue-600 transition-colors"
        >
          Pay with PayPal
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          You will be redirected to PayPal to complete your payment.
          After payment, please contact us at contact@sanganak.org to activate your subscription.
        </p>
      </div>
    </div>
  );
}
