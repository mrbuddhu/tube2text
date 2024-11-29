'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { supabaseAdmin } from '@/lib/supabase';

interface UsageStats {
  videos_processed: number;
  total_processing_time: number;
  total_characters_generated: number;
  last_processed_at: string;
}

export function UsageStats() {
  const { user } = useUser();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [plan, setPlan] = useState<'free' | 'pro' | 'business'>('free');

  // Plan limits
  const PLAN_LIMITS = {
    free: 5,
    pro: 50,
    business: Infinity
  };

  useEffect(() => {
    if (user?.id) {
      fetchUsageStats();
      fetchUserPlan();
    }
  }, [user?.id]);

  async function fetchUsageStats() {
    const { data, error } = await supabaseAdmin
      .from('usage_stats')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (error) {
      console.error('Error fetching usage stats:', error);
      return;
    }

    setStats(data);
  }

  async function fetchUserPlan() {
    // In a real app, this would check the user's subscription status
    // For now, we'll assume free tier
    setPlan('free');
  }

  if (!stats) {
    return <div>Loading...</div>;
  }

  const videosLimit = PLAN_LIMITS[plan];
  const videosUsagePercent = (stats.videos_processed / videosLimit) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Videos Processed */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500">Videos Processed</h3>
        <div className="mt-2 mb-4">
          <span className="text-3xl font-bold">
            {stats.videos_processed}
          </span>
          <span className="text-gray-500 text-sm ml-2">
            / {videosLimit === Infinity ? '∞' : videosLimit}
          </span>
        </div>
        {plan !== 'business' && (
          <Progress
            value={videosUsagePercent}
            className="h-2"
          />
        )}
      </Card>

      {/* Processing Time */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Processing Time</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">
            {Math.round(stats.total_processing_time / 60)}
          </span>
          <span className="text-gray-500 text-sm ml-2">minutes</span>
        </div>
      </Card>

      {/* Characters Generated */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500">Content Generated</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">
            {Math.round(stats.total_characters_generated / 1000)}K
          </span>
          <span className="text-gray-500 text-sm ml-2">characters</span>
        </div>
      </Card>

      {/* Last Activity */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500">Last Activity</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold">
            {stats.last_processed_at
              ? new Date(stats.last_processed_at).toLocaleDateString()
              : 'Never'}
          </span>
        </div>
      </Card>

      {/* Plan Status */}
      {plan === 'free' && videosUsagePercent > 80 && (
        <Card className="p-6 col-span-full bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-800">
                Approaching Free Tier Limit
              </h3>
              <p className="text-sm text-yellow-600">
                Upgrade to Pro for 50 videos/month
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade Now
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
