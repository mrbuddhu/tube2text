'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SpotCounter() {
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch('/api/spots');
        const data = await response.json();
        setSpotsLeft(data.spotsLeft);
      } catch (error) {
        console.error('Error fetching spots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpots();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchSpots, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 h-8 w-48 rounded" />
    );
  }

  if (spotsLeft === null) {
    return null;
  }

  const getUrgencyClass = () => {
    if (spotsLeft <= 5) return 'text-red-600 font-bold';
    if (spotsLeft <= 20) return 'text-orange-600 font-bold';
    return 'text-blue-600';
  };

  const getMessage = () => {
    if (spotsLeft === 0) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span>Early bird offer closed</span>
        </div>
      );
    }

    if (spotsLeft <= 5) {
      return (
        <div className="flex items-center space-x-2">
          <span className="animate-pulse">🔥</span>
          <span>Last {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} remaining!</span>
        </div>
      );
    }

    if (spotsLeft <= 20) {
      return `Only ${spotsLeft} early bird spots left`;
    }

    return `${spotsLeft} early access spots remaining`;
  };

  return (
    <div className={`text-sm ${getUrgencyClass()}`}>
      {getMessage()}
    </div>
  );
}
