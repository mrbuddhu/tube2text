'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function LimitedTimeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center justify-center flex-1 text-sm font-medium text-center">
          <p>
            🎉 Limited Time Offer: Get lifetime access for just $59.99!{' '}
            <Link href="/pricing" className="underline font-bold hover:text-white/90">
              Learn More
            </Link>
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 ml-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
