'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

type SubscriptionTier = 'free' | 'pro' | 'enterprise';

interface SubscriptionLimits {
  monthlyConversions: number;
  maxVideoLength: number; // in minutes
  features: string[];
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    monthlyConversions: 2,
    maxVideoLength: 15,
    features: [
      'Basic Transcription',
      'Simple Article Generation',
      'Basic Social Posts',
    ],
  },
  pro: {
    monthlyConversions: 50,
    maxVideoLength: 60,
    features: [
      'Advanced Transcription',
      'AI-Enhanced Articles',
      'Multiple Social Posts',
      'Custom Templates',
      'Priority Processing',
      'Analytics Dashboard',
      'Batch Processing',
    ],
  },
  enterprise: {
    monthlyConversions: 500,
    maxVideoLength: 240,
    features: [
      'Everything in Pro',
      'Custom AI Models',
      'API Access',
      'Custom Integrations',
      'Dedicated Support',
      'Team Management',
    ],
  },
};

interface SubscriptionContextType {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  conversionsUsed: number;
  conversionsRemaining: number;
  canUseFeature: (feature: string) => boolean;
  isFeatureLocked: (feature: string) => boolean;
  showUpgradePrompt: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [conversionsUsed, setConversionsUsed] = useState(0);

  useEffect(() => {
    // In a real app, fetch this from your backend
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        const data = await response.json();
        setTier(data.tier);
        setConversionsUsed(data.conversionsUsed);
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      }
    };

    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  const limits = TIER_LIMITS[tier];
  const conversionsRemaining = limits.monthlyConversions - conversionsUsed;

  const canUseFeature = (feature: string): boolean => {
    return limits.features.includes(feature);
  };

  const isFeatureLocked = (feature: string): boolean => {
    return !canUseFeature(feature);
  };

  const showUpgradePrompt = (feature: string): boolean => {
    return isFeatureLocked(feature) && (
      TIER_LIMITS.pro.features.includes(feature) ||
      TIER_LIMITS.enterprise.features.includes(feature)
    );
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        limits,
        conversionsUsed,
        conversionsRemaining,
        canUseFeature,
        isFeatureLocked,
        showUpgradePrompt,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
