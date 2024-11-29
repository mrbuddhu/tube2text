import { useCallback, useEffect } from 'react';

type AnalyticsEvent = {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
};

export const useAnalytics = () => {
  const STORAGE_KEY = 'tube2text_analytics';

  const getStoredEvents = useCallback((): AnalyticsEvent[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const trackEvent = useCallback((name: string, properties?: Record<string, any>) => {
    try {
      const events = getStoredEvents();
      const newEvent: AnalyticsEvent = {
        name,
        properties,
        timestamp: Date.now(),
      };
      
      events.push(newEvent);
      
      // Keep only last 100 events to prevent storage issues
      const trimmedEvents = events.slice(-100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedEvents));

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', newEvent);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [getStoredEvents]);

  const getEventStats = useCallback(() => {
    const events = getStoredEvents();
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    
    return {
      total: events.length,
      last24Hours: events.filter(e => e.timestamp > last24Hours).length,
      byType: events.reduce((acc: Record<string, number>, event) => {
        acc[event.name] = (acc[event.name] || 0) + 1;
        return acc;
      }, {}),
    };
  }, [getStoredEvents]);

  return {
    trackEvent,
    getEventStats,
  };
};
