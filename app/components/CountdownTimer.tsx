'use client';

import React from 'react';
import { Card, CardContent } from './ui/card';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
}) => {
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  React.useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{timeLeft.days}</div>
            <div className="text-sm text-gray-500">Days</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{timeLeft.hours}</div>
            <div className="text-sm text-gray-500">Hours</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{timeLeft.minutes}</div>
            <div className="text-sm text-gray-500">Minutes</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{timeLeft.seconds}</div>
            <div className="text-sm text-gray-500">Seconds</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
