'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface VideoRecord {
  id: string;
  title: string;
  url: string;
  status: string;
  created_at: string;
}

export const VideoHistory = () => {
  const { userId } = useAuth();
  const [videos, setVideos] = React.useState<VideoRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (userId) {
      fetchVideoHistory();
    }
  }, [userId]);

  const fetchVideoHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching video history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{video.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(video.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  video.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {video.status}
              </span>
            </div>
          ))}
          {videos.length === 0 && (
            <p className="text-center text-gray-500">No videos processed yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
