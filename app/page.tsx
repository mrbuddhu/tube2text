'use client';

import { EarlyBirdOffer } from './components/EarlyBirdOffer';
import { TranscriptionForm } from './components/TranscriptionForm';
import { useAuth } from './context/AuthContext';
import { ArrowRight, Youtube, FileText, Zap, Star } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Transform YouTube Videos into
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"> Professional Articles</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Instantly convert any YouTube video into a well-formatted article using AI. Perfect for content creators, journalists, and researchers.
            </p>
            <a 
              href="#pricing" 
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Youtube className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Paste YouTube URL</h3>
              <p className="text-gray-600">Simply paste any YouTube video URL into our converter</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Processing</h3>
              <p className="text-gray-600">Our AI transcribes and formats the content automatically</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Your Article</h3>
              <p className="text-gray-600">Download your formatted article in PDF, Word, or Markdown</p>
            </div>
          </div>
        </div>
      </section>

      {/* Try It Section */}
      {isAuthenticated && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Try It Now</h2>
            <TranscriptionForm />
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Early Bird Special Offer</h2>
            <p className="text-xl text-gray-600">
              Join as a founding member and get lifetime access at a special price
            </p>
          </div>
          <EarlyBirdOffer />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">24-Hour Trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Lifetime Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Priority Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
