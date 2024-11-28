'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LAUNCH_DATE = new Date('2025-01-01');

export function LaunchTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = LAUNCH_DATE.getTime() - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg text-center">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Clock className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold">Launch Countdown</h3>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{timeLeft.days}</div>
          <div className="text-xs text-gray-600">Days</div>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{timeLeft.hours}</div>
          <div className="text-xs text-gray-600">Hours</div>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-600">Minutes</div>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-600">Seconds</div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-sm text-gray-600">
          Join {Math.floor(Math.random() * 50 + 150)} others waiting for launch
        </p>
        <form className="flex space-x-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Notify Me
          </button>
        </form>
        <p className="text-xs text-gray-500">
          Get notified when we launch + exclusive early bird offer
        </p>
      </div>
    </div>
  );
}
