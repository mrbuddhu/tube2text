'use client';

import { useEffect, useState } from 'react';

interface SpotsRemainingProps {
  initialSpots: number;
  tier: string;
}

export function SpotsRemaining({ initialSpots, tier }: SpotsRemainingProps) {
  const [spots, setSpots] = useState(initialSpots);

  useEffect(() => {
    // Simulate spots being taken
    const interval = setInterval(() => {
      setSpots((current) => {
        // Randomly decrease spots (more aggressive near the end)
        if (current <= 5) {
          return Math.max(1, current - (Math.random() > 0.8 ? 1 : 0));
        }
        return Math.max(1, current - (Math.random() > 0.95 ? 1 : 0));
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <div className="inline-flex items-center px-3 py-1 bg-red-500 bg-opacity-20 rounded-full">
        <span className="text-red-400 font-semibold">
          {spots < 5 ? (
            <>🔥 Only {spots} {tier} spots remaining!</>
          ) : (
            <>{spots} spots remaining</>
          )}
        </span>
      </div>
      {spots < 5 && (
        <p className="mt-2 text-sm text-red-400 animate-pulse">
          ⚡ Hurry! These spots won't last long!
        </p>
      )}
    </div>
  );
}
