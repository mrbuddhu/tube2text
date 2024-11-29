import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  trackEvent, 
  getAnalytics, 
  clearAnalytics,
  AnalyticsEvent,
  EventType
} from '../lib/analytics';

describe('Analytics System', () => {
  beforeEach(() => {
    // Clear analytics before each test
    clearAnalytics();
  });

  it('should track video processing events', () => {
    const event: AnalyticsEvent = {
      type: EventType.VIDEO_PROCESSED,
      timestamp: new Date().toISOString(),
      data: {
        videoId: 'test-video-id',
        duration: '10:00',
        processingTime: 2500 // ms
      }
    };

    trackEvent(event);
    const analytics = getAnalytics();
    
    expect(analytics.events).toHaveLength(1);
    expect(analytics.events[0]).toMatchObject({
      type: EventType.VIDEO_PROCESSED,
      data: {
        videoId: 'test-video-id'
      }
    });
  });

  it('should track content generation events', () => {
    const event: AnalyticsEvent = {
      type: EventType.CONTENT_GENERATED,
      timestamp: new Date().toISOString(),
      data: {
        contentType: 'article',
        wordCount: 500,
        generationTime: 1500 // ms
      }
    };

    trackEvent(event);
    const analytics = getAnalytics();
    
    expect(analytics.events).toHaveLength(1);
    expect(analytics.events[0]).toMatchObject({
      type: EventType.CONTENT_GENERATED,
      data: {
        contentType: 'article',
        wordCount: 500
      }
    });
  });

  it('should track export events', () => {
    const event: AnalyticsEvent = {
      type: EventType.CONTENT_EXPORTED,
      timestamp: new Date().toISOString(),
      data: {
        format: 'markdown',
        contentType: 'article',
        size: 1024 // bytes
      }
    };

    trackEvent(event);
    const analytics = getAnalytics();
    
    expect(analytics.events).toHaveLength(1);
    expect(analytics.events[0]).toMatchObject({
      type: EventType.CONTENT_EXPORTED,
      data: {
        format: 'markdown'
      }
    });
  });

  it('should maintain chronological order of events', () => {
    const event1: AnalyticsEvent = {
      type: EventType.VIDEO_PROCESSED,
      timestamp: new Date(2023, 0, 1).toISOString(),
      data: { videoId: 'test-1' }
    };

    const event2: AnalyticsEvent = {
      type: EventType.VIDEO_PROCESSED,
      timestamp: new Date(2023, 0, 2).toISOString(),
      data: { videoId: 'test-2' }
    };

    trackEvent(event2);
    trackEvent(event1);
    
    const analytics = getAnalytics();
    expect(analytics.events).toHaveLength(2);
    expect(analytics.events[0].data.videoId).toBe('test-1');
    expect(analytics.events[1].data.videoId).toBe('test-2');
  });

  it('should handle error events', () => {
    const event: AnalyticsEvent = {
      type: EventType.ERROR,
      timestamp: new Date().toISOString(),
      data: {
        errorCode: 'PROCESSING_FAILED',
        message: 'Video processing failed',
        videoId: 'test-video-id'
      }
    };

    trackEvent(event);
    const analytics = getAnalytics();
    
    expect(analytics.events).toHaveLength(1);
    expect(analytics.events[0]).toMatchObject({
      type: EventType.ERROR,
      data: {
        errorCode: 'PROCESSING_FAILED'
      }
    });
  });

  it('should clear analytics data', () => {
    const event: AnalyticsEvent = {
      type: EventType.VIDEO_PROCESSED,
      timestamp: new Date().toISOString(),
      data: { videoId: 'test-video-id' }
    };

    trackEvent(event);
    expect(getAnalytics().events).toHaveLength(1);
    
    clearAnalytics();
    expect(getAnalytics().events).toHaveLength(0);
  });
});
