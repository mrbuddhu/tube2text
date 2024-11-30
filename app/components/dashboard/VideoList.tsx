'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface Video {
  id: string;
  title: string;
  url: string;
  status: string;
  created_at: string;
  thumbnail_url?: string;
}

export const VideoList = () => {
  const { userId } = useAuth();
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (userId) {
      fetchVideos();
    }
  }, [userId]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {video.thumbnail_url && (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-medium">{video.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(video.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    video.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {video.status}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => deleteVideo(video.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <p className="text-center text-gray-500">No videos found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
