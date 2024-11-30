'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface UsageStats {
  totalVideos: number;
  totalMinutes: number;
  totalCharacters: number;
  remainingCredits: number;
}

export const UsageStats = () => {
  const { userId } = useAuth();
  const [stats, setStats] = React.useState<UsageStats>({
    totalVideos: 0,
    totalMinutes: 0,
    totalCharacters: 0,
    remainingCredits: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (userId) {
      fetchUsageStats();
    }
  }, [userId]);

  const fetchUsageStats = async () => {
    try {
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('duration')
        .eq('user_id', userId);

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (videosError || userError) throw videosError || userError;

      const totalMinutes = videos?.reduce((acc, video) => acc + (video.duration || 0), 0) || 0;
      
      setStats({
        totalVideos: videos?.length || 0,
        totalMinutes,
        totalCharacters: totalMinutes * 1000, // Rough estimate
        remainingCredits: user?.credits || 0,
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalVideos}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Minutes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalMinutes}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Characters Generated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {stats.totalCharacters.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credits Left</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.remainingCredits}</p>
        </CardContent>
      </Card>
    </div>
  );
};
