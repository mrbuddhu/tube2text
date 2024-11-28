'use client';

import React from 'react';
import { Clock, Gift, Trophy, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import PayPalButton from './PayPalButton';
import SpotCounter from './SpotCounter';
import { useAuth } from '../context/AuthContext';

const LAUNCH_DATE = new Date('2025-01-01');
const EARLY_BIRD_PRICE = 149;

export function EarlyBirdOffer() {
  const { isAuthenticated } = useAuth();
  const daysLeft = Math.max(0, Math.ceil((LAUNCH_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-blue-900">Early Access Offer</h3>
      </div>

      {/* Trial Banner */}
      <div className="bg-white bg-opacity-50 rounded-md p-3 mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <p className="text-blue-800 font-medium">
            Try all features free for 24 hours
          </p>
        </div>
      </div>

      {/* Price and Timer */}
      <div className="bg-white rounded-md p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-bold text-blue-900">${EARLY_BIRD_PRICE}/year</span>
            <span className="text-sm text-gray-500">yearly subscription</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">{daysLeft} days left</span>
          </div>
        </div>
        <SpotCounter />
      </div>

      {/* Pricing Display */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Early Bird Special Offer</h2>
        <p className="text-xl mb-2">
          <span className="line-through text-gray-400">$249/year</span>{" "}
          <span className="text-2xl font-bold text-green-600">$149/year</span>
        </p>
        <p className="text-sm text-gray-600 mb-4">40% off regular price - Limited Time Offer</p>
        <div className="flex justify-center items-center space-x-2 mb-4">
          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Save $100/year
          </span>
          <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
            First 100 spots only
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-gray-700">Unlimited video transcriptions</span>
        </div>
        <div className="flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-gray-700">AI-powered article formatting</span>
        </div>
        <div className="flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-gray-700">Export to PDF, Word, Markdown</span>
        </div>
        <div className="flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-gray-700">Priority email support</span>
        </div>
      </div>

      {/* Action Button */}
      {isAuthenticated ? (
        <PayPalButton 
          onSuccess={async () => {
            // Increment spot counter after successful payment
            try {
              await fetch('/api/spots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'increment' })
              });
            } catch (error) {
              console.error('Error updating spots:', error);
            }
          }}
        />
      ) : (
        <Link href="/register">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
            Start Free Trial
          </button>
        </Link>
      )}

      {/* Trust Badge */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Secure payment • Instant access • No recurring fees
        </p>
      </div>
    </div>
  );
}
