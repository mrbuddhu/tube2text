'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoJob, videoQueue } from '@/lib/queue';
import { useUser } from '@clerk/nextjs';

export function VideoQueuePanel() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [user]);

  async function fetchJobs() {
    if (!user) return;
    try {
      const userJobs = await videoQueue.getUserJobs(user.id);
      setJobs(userJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (jobs.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-gray-500">No videos in queue</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium truncate" title={job.video_url}>
                {new URL(job.video_url).pathname.split('/').pop()}
              </h3>
              <span className={`px-2 py-1 rounded text-sm ${
                job.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : job.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : job.status === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>

            {job.status === 'processing' && (
              <Progress value={job.progress || 0} className="h-2" />
            )}

            {job.error && (
              <p className="text-sm text-red-600">
                Error: {job.error}
              </p>
            )}

            <div className="text-sm text-gray-500">
              <p>Added: {new Date(job.created_at).toLocaleString()}</p>
              {job.completed_at && (
                <p>Completed: {new Date(job.completed_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
