'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to your analytics service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-gray-300 mb-8">Don&apos;t worry, we&apos;re on it.</p>
        <Button
          onClick={reset}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
