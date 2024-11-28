'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface UsageStats {
  used: number;
  limit: number;
  plan: string;
  remaining: number;
}

interface ProcessedVideo {
  id: string;
  title: string;
  processedAt: string;
  wordCount: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [recentVideos, setRecentVideos] = useState<ProcessedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchUsageStats();
      fetchRecentVideos();
    }
  }, [session]);

  const fetchUsageStats = async () => {
    try {
      const res = await fetch('/api/usage');
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      toast.error('Failed to load usage statistics');
    }
  };

  const fetchRecentVideos = async () => {
    try {
      // This would be implemented in your backend
      const mockData: ProcessedVideo[] = [
        {
          id: '1',
          title: 'Getting Started with Next.js',
          processedAt: new Date().toISOString(),
          wordCount: 1500,
        },
        // Add more mock data as needed
      ];
      setRecentVideos(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your account and recent activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Usage Stats */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Videos Used
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {usage?.used}/{usage?.limit}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Current Plan
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {usage?.plan.charAt(0).toUpperCase() + usage?.plan.slice(1)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Words Processed */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Words
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {recentVideos.reduce((acc, vid) => acc + vid.wordCount, 0).toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Time Saved */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Time Saved
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {Math.round(recentVideos.reduce((acc, vid) => acc + vid.wordCount, 0) / 200)} mins
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {recentVideos.map((video) => (
                <li key={video.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {video.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {video.wordCount.toLocaleString()} words
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm text-gray-500">
                        {new Date(video.processedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upgrade CTA */}
        {usage?.plan === 'free' && (
          <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-indigo-900">
                  Upgrade to Pro
                </h3>
                <p className="mt-2 text-sm text-indigo-700">
                  Get unlimited videos, AI enhancement, and priority support.
                </p>
              </div>
              <a
                href="/pricing"
                className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                View Plans
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
