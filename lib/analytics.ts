// Analytics events for tracking user behavior and app performance
export enum EventType {
  VIDEO_PROCESSED = 'VIDEO_PROCESSED',
  CONTENT_GENERATED = 'CONTENT_GENERATED',
  CONTENT_EXPORTED = 'CONTENT_EXPORTED',
  ERROR = 'ERROR'
}

export interface AnalyticsEvent {
  type: EventType;
  timestamp: string;
  data: any;
}

interface Analytics {
  events: AnalyticsEvent[];
}

// Initialize analytics in localStorage if not exists
const initAnalytics = (): void => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('analytics')) {
    localStorage.setItem('analytics', JSON.stringify({ events: [] }));
  }
};

// Get analytics data
export const getAnalytics = (): Analytics => {
  if (typeof window === 'undefined') return { events: [] };
  
  initAnalytics();
  const data = localStorage.getItem('analytics');
  return JSON.parse(data || '{"events": []}');
};

// Track a new event
export const trackEvent = (event: AnalyticsEvent): void => {
  if (typeof window === 'undefined') return;
  
  const analytics = getAnalytics();
  
  // Add new event
  analytics.events.push(event);
  
  // Sort events by timestamp
  analytics.events.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Save to localStorage
  localStorage.setItem('analytics', JSON.stringify(analytics));
};

// Clear all analytics data
export const clearAnalytics = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('analytics', JSON.stringify({ events: [] }));
};
