'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export function PricingCalculator() {
  const [videos, setVideos] = useState(10);
  const [hours, setHours] = useState(2);
  
  const MANUAL_COST = 1000; // ₹1000 per hour for manual transcription
  const PRO_MONTHLY = 2499;
  const LIFETIME = 24999;

  const manualCost = hours * MANUAL_COST * videos;
  const proSavings = manualCost - PRO_MONTHLY;
  const lifetimeSavings = manualCost * 12 - LIFETIME;

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-medium">Savings Calculator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Videos per month
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={videos}
            onChange={(e) => setVideos(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{videos} videos</span>
            <span>₹{(videos * hours * MANUAL_COST).toLocaleString('en-IN')}/month manual cost</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Average video length (hours)
          </label>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{hours} hours</span>
            <span>₹{MANUAL_COST.toLocaleString('en-IN')}/hour manual cost</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Monthly Pro Savings</h4>
            <p className="text-2xl font-bold text-blue-600">
              ₹{proSavings.toLocaleString('en-IN')}/month
            </p>
            <p className="text-sm text-gray-600 mt-1">
              vs manual transcription cost of ₹{manualCost.toLocaleString('en-IN')}/month
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2">Lifetime Access Savings</h4>
            <p className="text-2xl font-bold text-green-600">
              ₹{lifetimeSavings.toLocaleString('en-IN')}/year
            </p>
            <p className="text-sm text-gray-600 mt-1">
              vs manual transcription cost of ₹{(manualCost * 12).toLocaleString('en-IN')}/year
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
