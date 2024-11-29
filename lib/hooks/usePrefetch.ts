import { useEffect } from 'react';
import { prefetch_manager } from '../utils/prefetch';
import { useDevice } from './useDevice';

export function usePrefetch(urls: string[], priority: boolean = false) {
  const { isMobile, connection } = useDevice();

  useEffect(() => {
    // Don't prefetch on slow connections or mobile devices unless priority is true
    if (!priority && (
      isMobile || 
      connection.effectiveType === '2g' || 
      connection.effectiveType === 'slow-2g'
    )) {
      return;
    }

    urls.forEach(url => {
      prefetch_manager.prefetch(url, priority);
    });
  }, [urls, priority, isMobile, connection.effectiveType]);
}
