'use client';

import React from 'react';
import { Progress } from './ui/progress';

interface TranscriptionProgressProps {
  status: string;
  progress: number;
}

export function TranscriptionProgress({ status, progress }: TranscriptionProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{status}</span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
