'use client';

import Image from 'next/image';
import Link from 'next/link';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, isPaidUser } = useAuth();
  const router = useRouter();

  const handlePlanClick = (planType: string) => {
    if (!isAuthenticated && planType !== 'Free Trial') {
      router.push('/login');
      return;
    }

    switch (planType) {
      case 'Free Trial':
        if (!isAuthenticated) {
          router.push('/login');
        } else {
          router.push('/dashboard');
        }
        break;
      case 'Basic':
        if (isPaidUser) {
          router.push('/dashboard');
        } else {
          router.push('/pricing/basic');
        }
        break;
      case 'Pro':
        if (isPaidUser) {
          router.push('/dashboard');
        } else {
          router.push('/pricing/pro');
        }
        break;
    }
  };

  return (
    <>
      <div className="relative isolate">
        {/* Background decoration */}
        <div className="absolute inset-x-0 top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        {/* Hero Section */}
        <div className="relative px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-36">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Transform YouTube Videos into Engaging Articles
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Instantly convert YouTube content into well-structured, readable articles. Perfect for content creators, researchers, and knowledge seekers.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 hover:scale-105"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#features"
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-all duration-300"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Powerful Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to transform video content
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our AI-powered platform makes it easy to convert YouTube videos into well-structured articles, complete with formatting and organization.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, transparent pricing
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Start with a 14-day free trial. No credit card required.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-6xl lg:grid-cols-3">
            {plans.map((plan, planIdx) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${
                  plan.highlight ? 'relative z-10 scale-105 shadow-xl ring-2 ring-indigo-600' : 'bg-white/60'
                } ${planIdx === 1 ? 'sm:mx-8 lg:mx-0' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 
                      className={`text-lg font-semibold leading-8 ${
                        plan.highlight ? 'text-indigo-600' : 'text-gray-900'
                      }`}
                    >
                      {plan.name}
                    </h3>
                    {plan.highlight && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">/{plan.duration}</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handlePlanClick(plan.name)}
                  className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.highlight
                      ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600'
                      : 'text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300'
                  } transition-all duration-300 hover:scale-[1.02]`}
                >
                  {isAuthenticated 
                    ? isPaidUser 
                      ? 'Go to Dashboard' 
                      : plan.ctaText
                    : 'Login to Start'
                  }
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

const features = [
  {
    name: 'AI-Powered Transcription',
    description: 'Advanced AI technology that accurately converts speech to text while maintaining context and meaning.',
    icon: function DocumentIcon() {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    },
  },
  {
    name: 'Smart Formatting',
    description: 'Automatically formats content with headers, paragraphs, and bullet points for better readability.',
    icon: function FormatIcon() {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
      );
    },
  },
  {
    name: 'Instant Processing',
    description: 'Get your transcribed content in seconds, not hours. Perfect for time-sensitive content creation.',
    icon: function SpeedIcon() {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    },
  },
];

const plans = [
  {
    name: 'Free Trial',
    description: 'Try Tube2Text with no commitment.',
    price: '$0',
    duration: '14 days',
    features: [
      '5 video conversions',
      'Basic AI formatting',
      'Text export',
      'Community support',
      'No credit card required',
    ],
    ctaText: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Basic',
    description: 'Perfect for individuals and small content creators.',
    price: '$9',
    duration: 'per month',
    features: [
      '30 videos per month',
      'Basic formatting',
      'Export to Text & HTML',
      'Email support',
      'API access (100 calls/day)',
    ],
    ctaText: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    description: 'Ideal for professional content creators and teams.',
    price: '$29',
    duration: 'per month',
    features: [
      'Unlimited videos',
      'Advanced AI formatting',
      'Export to Text, HTML & Markdown',
      'Priority support',
      'API access (unlimited)',
      'Team collaboration',
    ],
    ctaText: 'Go Pro',
    highlight: true,
  },
];
