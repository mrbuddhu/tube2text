// Analytics events for tracking user behavior and app performance
export enum EventType {
  PAGE_VIEW = 'page_view',
  VIDEO_PROCESS_START = 'video_process_start',
  VIDEO_PROCESS_COMPLETE = 'video_process_complete',
  VIDEO_PROCESS_ERROR = 'video_process_error',
  EXPORT_START = 'export_start',
  EXPORT_COMPLETE = 'export_complete',
  EXPORT_ERROR = 'export_error',
  USER_PREFERENCE_UPDATE = 'user_preference_update',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_ERROR = 'payment_error'
}

export interface AnalyticsEvent {
  type: EventType;
  timestamp: string;
  properties?: Record<string, any>;
}

interface Analytics {
  events: AnalyticsEvent[];
}

// Initialize analytics in localStorage if not exists
const initAnalytics = (): void => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('analytics_events')) {
    localStorage.setItem('analytics_events', JSON.stringify({ events: [] }));
  }
};

// Get analytics data
export const getAnalytics = (): Analytics => {
  if (typeof window === 'undefined') return { events: [] };
  
  const data = localStorage.getItem('analytics_events');
  return data ? JSON.parse(data) : { events: [] };
};

// Track a new event
export const trackEvent = (eventType: EventType, properties?: Record<string, any>): void => {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventType, properties);
    }

    // Store in localStorage for now
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    events.push({
      type: eventType,
      properties,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('analytics_events', JSON.stringify(events));

  } catch (error) {
    console.error('[Analytics Error]', error);
  }
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number, context?: Record<string, any>): void => {
  // Store performance metrics in localStorage
  try {
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    metrics.push({
      metric,
      value,
      context,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('performance_metrics', JSON.stringify(metrics));
  } catch (error) {
    console.error('[Performance Tracking Error]', error);
  }
};

// Track errors
export const trackError = (error: Error, context?: Record<string, any>): void => {
  trackEvent(EventType.VIDEO_PROCESS_ERROR, {
    error: error.message,
    stack: error.stack,
    ...context,
  });
};

// Clear all analytics data
export const clearAnalytics = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('analytics_events');
  localStorage.removeItem('performance_metrics');
  initAnalytics();
};

// Initialize on load
if (typeof window !== 'undefined') {
  initAnalytics();
}
