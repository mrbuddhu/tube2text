'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import VideoInput from '../components/VideoInput';
import ArticlePreview from '../components/ArticlePreview';
import PricingPlans from '../components/PricingPlans';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [transcription, setTranscription] = useState('');
  const [showPricing, setShowPricing] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block text-indigo-600">Tube2Text</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Sign in to start converting your YouTube videos into beautifully formatted articles.
            </p>
          </div>
          <PricingPlans />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Convert your YouTube videos into articles with just one click.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-8">
            <VideoInput onTranscriptionComplete={setTranscription} />
            {transcription && <ArticlePreview content={transcription} />}
          </div>

          {/* Pricing Section Toggle */}
          <div className="text-center pt-8">
            <button
              onClick={() => setShowPricing(!showPricing)}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {showPricing ? 'Hide pricing plans' : 'View pricing plans'}
            </button>
          </div>

          {/* Pricing Plans */}
          {showPricing && <PricingPlans />}
        </div>
      </main>
    </div>
  );
}
