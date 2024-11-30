'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert } from './ui/alert';

interface SpotsRemainingProps {
  total: number;
  taken: number;
  onSoldOut?: () => void;
}

export const SpotsRemaining: React.FC<SpotsRemainingProps> = ({
  total,
  taken,
  onSoldOut,
}) => {
  const remaining = total - taken;
  const percentageTaken = (taken / total) * 100;

  React.useEffect(() => {
    if (remaining === 0) {
      onSoldOut?.();
    }
  }, [remaining, onSoldOut]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limited Spots Available</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  {remaining} spots left
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {percentageTaken.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${percentageTaken}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
              />
            </div>
          </div>

          {remaining <= 10 && (
            <Alert variant="warning">
              Only {remaining} spots remaining! Don't miss out on this limited-time offer.
            </Alert>
          )}

          {remaining === 0 && (
            <Alert variant="error">
              All spots have been taken. Join the waitlist to be notified when more spots become available.
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
