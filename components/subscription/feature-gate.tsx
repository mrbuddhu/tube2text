'use client';

import { useSubscription } from '@/context/subscription-context';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
}

export function FeatureGate({ feature, children }: FeatureGateProps) {
  const { isFeatureLocked, showUpgradePrompt, tier } = useSubscription();

  if (!isFeatureLocked(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gray-100/90 dark:bg-gray-800/90 rounded-lg flex items-center justify-center backdrop-blur-sm z-50">
        <div className="text-center p-4">
          <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          {showUpgradePrompt(feature) ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Upgrade to {tier === 'free' ? 'Pro' : 'Enterprise'} to unlock this feature
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Upgrade Now
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This feature is not available in your current plan
            </p>
          )}
        </div>
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  );
}
