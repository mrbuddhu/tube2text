'use client';

import React, { useState } from 'react';
import { Share2, Users, Sparkles } from 'lucide-react';

export function WaitlistIncentive() {
  const [referralCode] = useState(() => Math.random().toString(36).substring(7));
  const [position] = useState(() => Math.floor(Math.random() * 50 + 100));

  const shareText = `Skip the waitlist for Tube2Text - the free AI video transcription tool! Use my referral code: ${referralCode}`;

  const handleShare = async (platform: 'twitter' | 'whatsapp' | 'copy') => {
    const shareUrl = `https://tube2text.com?ref=${referralCode}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareText + ' ' + shareUrl);
        break;
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold">Waitlist Position: #{position}</h3>
      </div>

      <div className="space-y-6">
        <div className="bg-white bg-opacity-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span>Skip the Waitlist!</span>
          </h4>
          <p className="text-sm text-gray-600">
            Share with friends to move up the waitlist. Each referral moves you up 10 spots!
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Share2 className="w-4 h-4" />
              <span>Twitter</span>
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center justify-center space-x-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center justify-center space-x-2 p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <Share2 className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Your Referral Code</h4>
          <div className="flex items-center space-x-2">
            <code className="flex-1 p-2 bg-white rounded border font-mono text-center">
              {referralCode}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(referralCode)}
              className="p-2 text-blue-600 hover:text-blue-700"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Share this code to give friends instant access + 50% off
          </p>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Current Position: #{position}</p>
          <p>Referrals Needed to Skip Waitlist: {Math.ceil(position / 10)}</p>
        </div>
      </div>
    </div>
  );
}
