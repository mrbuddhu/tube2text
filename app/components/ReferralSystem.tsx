'use client';

import React, { useState } from 'react';
import { Share2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReferralSystemProps {
  userEmail?: string;
}

export function ReferralSystem({ userEmail }: ReferralSystemProps) {
  const [referralCode] = useState(userEmail ? btoa(userEmail).slice(0, 8) : '');
  const [showReferralModal, setShowReferralModal] = useState(false);

  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  const rewards = {
    referrer: '1 Month Pro Free',
    referee: '50% off Lifetime Access'
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Join Tube2Text Pro',
        text: `Get 50% off Lifetime Access to Tube2Text Pro! Use my referral code: ${referralCode}`,
        url: referralLink
      });
      toast.success('Shared successfully!');
    } catch (err) {
      // Fallback to copy
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowReferralModal(true)}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
      >
        <Gift className="w-4 h-4" />
        <span>Earn Free Access</span>
      </button>

      {showReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Refer & Earn</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Your Rewards</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm">Get <span className="font-bold">{rewards.referrer}</span> for each friend who upgrades!</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Friend's Reward</h4>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm">They get <span className="font-bold">{rewards.referee}</span> on signup!</p>
                </div>
              </div>

              {userEmail ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Referral Link</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 p-2 bg-gray-50 rounded border text-sm"
                    />
                    <button
                      onClick={handleShare}
                      className="p-2 text-blue-600 hover:text-blue-700"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm">Sign in to get your referral link and start earning!</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">How it works</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Share your unique referral link with friends</li>
                  <li>They get 50% off Lifetime Access</li>
                  <li>You get 1 month of Pro access FREE</li>
                  <li>No limit on referrals - refer more to earn more!</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowReferralModal(false)}
              className="mt-6 w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {userEmail ? 'Start Sharing' : 'Sign in to Start'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
