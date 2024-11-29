'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endDate: Date;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center space-x-2 text-red-400 font-mono">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-xs">HOURS</span>
      </div>
      <span className="text-2xl">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-xs">MINS</span>
      </div>
      <span className="text-2xl">:</span>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-xs">SECS</span>
      </div>
    </div>
  );
}
