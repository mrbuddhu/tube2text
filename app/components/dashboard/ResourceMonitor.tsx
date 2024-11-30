'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface ResourceStats {
  cpuUsage: number;
  memoryUsage: number;
  activeJobs: number;
  queuedJobs: number;
  storageUsed: number;
  apiCalls: number;
}

export const ResourceMonitor = () => {
  const { userId } = useAuth();
  const [stats, setStats] = React.useState<ResourceStats>({
    cpuUsage: 0,
    memoryUsage: 0,
    activeJobs: 0,
    queuedJobs: 0,
    storageUsed: 0,
    apiCalls: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (userId) {
      fetchResourceStats();
      const interval = setInterval(fetchResourceStats, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchResourceStats = async () => {
    try {
      // Get active and queued jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('status')
        .eq('user_id', userId);

      if (jobsError) throw jobsError;

      const activeJobs = jobs?.filter(job => job.status === 'processing').length || 0;
      const queuedJobs = jobs?.filter(job => job.status === 'queued').length || 0;

      // Get storage usage
      const { data: storage, error: storageError } = await supabase
        .from('storage_usage')
        .select('bytes_used')
        .eq('user_id', userId)
        .single();

      if (storageError) throw storageError;

      // Get API calls
      const { data: api, error: apiError } = await supabase
        .from('api_usage')
        .select('calls')
        .eq('user_id', userId)
        .single();

      if (apiError) throw apiError;

      // Simulate CPU and memory usage (replace with actual metrics in production)
      const cpuUsage = Math.random() * 100;
      const memoryUsage = Math.random() * 100;

      setStats({
        cpuUsage,
        memoryUsage,
        activeJobs,
        queuedJobs,
        storageUsed: storage?.bytes_used || 0,
        apiCalls: api?.calls || 0,
      });
    } catch (error) {
      console.error('Error fetching resource stats:', error);
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
        <CardTitle>Resource Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
            <div className="mt-1">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${stats.cpuUsage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  />
                </div>
                <p className="text-right text-sm mt-1">
                  {stats.cpuUsage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
            <div className="mt-1">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${stats.memoryUsage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  />
                </div>
                <p className="text-right text-sm mt-1">
                  {stats.memoryUsage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
            <p className="text-2xl font-semibold">{stats.activeJobs}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Queued Jobs</h3>
            <p className="text-2xl font-semibold">{stats.queuedJobs}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
            <p className="text-2xl font-semibold">
              {(stats.storageUsed / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">API Calls</h3>
            <p className="text-2xl font-semibold">{stats.apiCalls}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
