'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface VideoAnalytics {
  totalViews: number;
  averageLength: number;
  popularCategories: { category: string; count: number }[];
  processingTimes: { date: string; time: number }[];
}

export const VideoAnalytics = () => {
  const { userId } = useAuth();
  const [analytics, setAnalytics] = React.useState<VideoAnalytics>({
    totalViews: 0,
    averageLength: 0,
    popularCategories: [],
    processingTimes: [],
  });

  React.useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Calculate analytics
      const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
      const averageLength = videos.reduce((acc, video) => acc + (video.duration || 0), 0) / videos.length;

      // Get popular categories
      const categories = videos.reduce((acc, video) => {
        if (video.category) {
          acc[video.category] = (acc[video.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const popularCategories = Object.entries(categories)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get processing times
      const processingTimes = videos
        .filter(video => video.processing_time)
        .map(video => ({
          date: video.created_at,
          time: video.processing_time,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setAnalytics({
        totalViews,
        averageLength,
        popularCategories,
        processingTimes,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Total Views</h3>
            <p className="text-2xl font-bold">{analytics.totalViews}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Average Length</h3>
            <p className="text-2xl font-bold">
              {Math.round(analytics.averageLength)} minutes
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Popular Categories</h3>
            <ul className="space-y-1">
              {analytics.popularCategories.map((cat) => (
                <li key={cat.category} className="flex justify-between">
                  <span>{cat.category}</span>
                  <span className="text-gray-500">{cat.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Recent Processing Times</h3>
            <ul className="space-y-1">
              {analytics.processingTimes.map((pt) => (
                <li key={pt.date} className="flex justify-between">
                  <span>{new Date(pt.date).toLocaleDateString()}</span>
                  <span className="text-gray-500">{pt.time}s</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
