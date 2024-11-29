import { useState, useEffect } from 'react';
import { performance_monitor } from '../utils/performance';

interface SmartLoadingOptions {
  key: string;
  minLoadingTime?: number;
  maxLoadingTime?: number;
}

export function useSmartLoading({ key, minLoadingTime = 500, maxLoadingTime = 3000 }: SmartLoadingOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const start = () => {
    setIsLoading(true);
    setProgress(0);
    return performance_monitor.startMeasure(key);
  };

  const stop = () => {
    setIsLoading(false);
    setProgress(100);
  };

  useEffect(() => {
    if (!isLoading) return;

    const avgTime = performance_monitor.getAverageMetric(key) || maxLoadingTime;
    const expectedDuration = Math.max(minLoadingTime, Math.min(avgTime, maxLoadingTime));
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / expectedDuration) * 100, 99);
      setProgress(Math.round(newProgress));
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, key, minLoadingTime, maxLoadingTime]);

  return {
    isLoading,
    progress,
    start,
    stop
  };
}
