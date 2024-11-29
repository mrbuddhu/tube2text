'use client';

import { useAuth } from "@clerk/nextjs";
import { useAnalytics } from '../lib/hooks/useAnalytics';
import { useSmartLoading } from '../lib/hooks/useSmartLoading';
import { useOffline } from '../lib/hooks/useOffline';
import { usePerformance } from '../lib/hooks/usePerformance';
import { useDevice } from '../lib/hooks/useDevice';
import { usePrefetch } from '../lib/hooks/usePrefetch';
import { TranscriptionForm } from '../app/components/TranscriptionForm';
import { Features } from '../app/components/Features';
import { PricingPlans } from '../app/components/PricingPlans';
import { Header } from '../app/components/Header';
import { Footer } from '../app/components/Footer';
import { Analytics } from '../app/components/Analytics';
import { ErrorBoundary } from '../app/components/ui/error-boundary';
import { LoadingSpinner } from '../app/components/ui/loading-spinner';

export function HomePageClient() {
  const { isSignedIn } = useAuth();
  const { trackEvent } = useAnalytics();
  const { isLoading, progress, start, stop } = useSmartLoading({
    key: 'home_page_load',
    minLoadingTime: 800
  });
  const { isOnline } = useOffline();
  const { trackPerformance } = usePerformance();
  const { isMobile } = useDevice();
  const { prefetchRoute } = usePrefetch();

  // Track page load performance
  trackPerformance('home_page_load');

  // Prefetch important routes
  prefetchRoute('/dashboard');
  prefetchRoute('/pricing');

  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        {isLoading ? (
          <LoadingSpinner progress={progress} />
        ) : (
          <>
            <Header />
            <TranscriptionForm />
            <Features />
            <PricingPlans />
            <Footer />
            <Analytics />
          </>
        )}
      </main>
    </ErrorBoundary>
  );
}
