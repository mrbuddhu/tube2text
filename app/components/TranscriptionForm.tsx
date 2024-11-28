'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FileText, Loader2 } from 'lucide-react';
import { Share2 } from 'lucide-react';
import { WaitlistIncentive } from './WaitlistIncentive';
import { EarlyBirdOffer } from './EarlyBirdOffer';

export function TranscriptionForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please login to use this feature');
      return;
    }

    setIsLoading(true);
    try {
      // For now, just simulate the transcription
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Transcription completed! Check your dashboard.');
      setUrl('');
    } catch (error) {
      toast.error('Failed to transcribe video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Convert Video to Article</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            YouTube Video URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://www.youtube.com/watch?v=..."
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Converting...</span>
            </>
          ) : (
            <span>Convert to Article</span>
          )}
        </button>

        <div className="text-sm text-gray-500 text-center">
          Supported formats: PDF, Word, and Markdown
        </div>
      </form>

      {showUpgradeModal && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-lg font-medium text-yellow-900">Join the Waitlist</h3>
          <p className="mt-2 text-sm text-yellow-700">
            We're currently in early access. Join our waitlist to be notified when we launch!
          </p>
          <div className="mt-4 flex space-x-4">
            <WaitlistIncentive />
            <EarlyBirdOffer />
          </div>
        </div>
      )}
    </div>
  );
}
