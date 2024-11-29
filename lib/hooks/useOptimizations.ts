import { useState, useEffect, useCallback } from 'react';
import { useDebounce, useThrottle } from './useDebounce';
import { offline_manager } from '../utils/offline';
import { cache } from '../utils/cache';

interface UseOptimizationsOptions {
  cacheKey?: string;
  cacheDuration?: number;
  debounceDelay?: number;
  throttleDelay?: number;
}

export function useOptimizations<T>({
  cacheKey,
  cacheDuration = 1000 * 60 * 5, // 5 minutes
  debounceDelay = 500,
  throttleDelay = 1000
}: UseOptimizationsOptions = {}) {
  const [isOnline, setIsOnline] = useState(true);
  const [value, setValue] = useState<T | null>(null);
  
  const debouncedValue = useDebounce(value, debounceDelay);
  const throttledValue = useThrottle(value, throttleDelay);

  useEffect(() => {
    // Load from cache if available
    if (cacheKey) {
      const cached = cache.get<T>(cacheKey);
      if (cached) setValue(cached);
    }

    // Setup offline listener
    const cleanup = offline_manager.addListener((online) => {
      setIsOnline(online);
    });

    return () => {
      cleanup();
    };
  }, [cacheKey]);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    if (cacheKey) {
      cache.set(cacheKey, newValue, cacheDuration);
    }
  }, [cacheKey, cacheDuration]);

  const queueUpdate = useCallback(async (updateFn: () => Promise<void>) => {
    if (isOnline) {
      await updateFn();
    } else {
      await offline_manager.queueRequest('updates', updateFn);
    }
  }, [isOnline]);

  return {
    value,
    debouncedValue,
    throttledValue,
    updateValue,
    queueUpdate,
    isOnline
  };
}
