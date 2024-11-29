'use client';

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { SpotsRemaining } from "@/components/SpotsRemaining";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const tiers = [
  {
    name: "Free Trial",
    price: "$0",
    description: "Try Tube2Text with 2 free conversions",
    features: [
      "2 free video conversions",
      "Basic AI transcription",
      "Article generation",
      "Social media snippets",
      "No credit card required",
      "24-hour support",
    ],
    highlight: false,
    action: "Start Free Trial",
    conversionUrl: "/convert"
  },
  {
    name: "Early Bird Pro",
    price: "$49.99",
    originalPrice: "$249.99",
    description: "EARLY BIRD: 80% OFF - Limited spots available!",
    features: [
      "50 videos per month",
      "AI Article Generation",
      "Sentiment Analysis",
      "Topic Detection",
      "Social Media Content",
      "Automatic Hashtags",
      "Priority Support",
      "Lifetime Updates"
    ],
    paypalLink: "https://paypal.me/mrbuddhu1/49.99",
    highlight: true,
    initialSpots: 50,
    action: "Get Pro Access",
  },
  {
    name: "Business",
    price: "$149.99",
    originalPrice: "$599.99",
    description: "EARLY BIRD: 75% OFF - Limited spots available!",
    features: [
      "Unlimited videos",
      "All Pro features",
      "Team Access (5 members)",
      "Custom Branding",
      "API Access",
      "Advanced Analytics",
      "24/7 Priority Support",
      "1-on-1 Onboarding Call"
    ],
    paypalLink: "https://paypal.me/mrbuddhu1/149.99",
    highlight: false,
    initialSpots: 20,
    action: "Get Business Access",
  }
];

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handlePurchase = (tier: any) => {
    if (!isSignedIn) {
      return false; // Will trigger the SignInButton modal
    }
    // If user is signed in, redirect to PayPal
    window.open(tier.paypalLink, '_blank');
    return true;
  };

  return (
    <div className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-300">
            Start with 2 free conversions, no credit card required
          </p>
          
          {/* Social Proof */}
          <div className="mt-6 text-gray-300">
            <p>Join 1,000+ content creators who trust Tube2Text</p>
            <div className="flex items-center justify-center mt-2">
              <div className="flex text-yellow-400">{'★'.repeat(5)}</div>
              <span className="ml-2">4.9/5 from 200+ reviews</span>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {tiers.map((tier) => (
            <div key={tier.name} 
                 className={`relative p-8 bg-gray-800 rounded-2xl shadow-xl flex flex-col
                            ${tier.highlight ? 'ring-4 ring-purple-500 transform hover:scale-105' : 'transform hover:scale-105'}
                            transition-all duration-300 animate-fade-in`}>
              {tier.highlight && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                <div className="mt-4 flex items-baseline text-white">
                  <span className="text-5xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.name !== "Free Trial" && <span className="ml-1 text-xl font-semibold">/lifetime</span>}
                </div>
                {tier.originalPrice && (
                  <p className="mt-2 text-gray-300 line-through">{tier.originalPrice}</p>
                )}
                <p className="mt-4 text-lg text-purple-400">{tier.description}</p>

                {tier.initialSpots && (
                  <div className="mt-4">
                    <SpotsRemaining initialSpots={tier.initialSpots} tier={tier.name} />
                  </div>
                )}

                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="flex-shrink-0 w-6 h-6 text-green-400" />
                      <span className="ml-3 text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isSignedIn ? (
                <Button 
                  className={`mt-8 w-full ${
                    tier.highlight 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  } text-white transform hover:scale-105 transition-all duration-300`}
                  onClick={() => {
                    if (tier.paypalLink) {
                      window.open(tier.paypalLink, '_blank');
                    } else if (tier.conversionUrl) {
                      router.push(tier.conversionUrl);
                    }
                  }}
                >
                  {tier.action}
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button 
                    className={`mt-8 w-full ${
                      tier.highlight 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    } text-white transform hover:scale-105 transition-all duration-300`}
                  >
                    {tier.action}
                  </Button>
                </SignInButton>
              )}
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="p-6 border border-gray-700 rounded-lg bg-gray-800 transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white">One-Time Payment</h3>
            <p className="text-gray-300">No recurring fees or hidden charges</p>
          </div>
          <div className="p-6 border border-gray-700 rounded-lg bg-gray-800 transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white">Lifetime Updates</h3>
            <p className="text-gray-300">Get all future features and improvements</p>
          </div>
          <div className="p-6 border border-gray-700 rounded-lg bg-gray-800 transform hover:scale-105 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white">Priority Support</h3>
            <p className="text-gray-300">Get help when you need it</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white text-center">Frequently Asked Questions</h3>
          <div className="mt-8 grid gap-6">
            <div className="p-6 bg-gray-800 rounded-lg transform hover:scale-105 transition-all duration-300">
              <h4 className="text-lg font-semibold text-white">What's included in the free trial?</h4>
              <p className="mt-2 text-gray-300">
                You get 2 free video conversions with access to basic AI transcription, article generation, 
                and social media content creation. No credit card required.
              </p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg transform hover:scale-105 transition-all duration-300">
              <h4 className="text-lg font-semibold text-white">What's included in the lifetime access?</h4>
              <p className="mt-2 text-gray-300">
                Your lifetime access includes all current features, future updates, and improvements. 
                There are no additional fees or subscriptions needed.
              </p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg transform hover:scale-105 transition-all duration-300">
              <h4 className="text-lg font-semibold text-white">Can I upgrade my plan later?</h4>
              <p className="mt-2 text-gray-300">
                Yes! You can upgrade from Pro to Business plan at any time. 
                The upgrade cost will be prorated based on your current plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
