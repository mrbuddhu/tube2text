'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
}

interface ProcessedVideo {
  info: {
    title: string;
    duration: number;
    thumbnailUrl: string;
  };
  transcript: {
    text: string;
    chapters: Array<{ title: string; content: string }>;
    summary: string;
    keywords: string[];
  };
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [usage, setUsage] = useState<UsageStats>({ used: 0, limit: 5, remaining: 5 });
  const [recentVideos, setRecentVideos] = useState<ProcessedVideo[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process video');
      }

      const result = await response.json();
      setRecentVideos([result, ...recentVideos]);
      setUsage(prev => ({ ...prev, used: prev.used + 1, remaining: prev.remaining - 1 }));
      toast.success('Video processed successfully!');
      setUrl('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Usage Stats */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-gray-500">Videos Processed</p>
              <p className="text-2xl font-semibold">{usage.used}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DocumentTextIcon className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-gray-500">Daily Limit</p>
              <p className="text-2xl font-semibold">{usage.limit}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ClockIcon className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-gray-500">Remaining Today</p>
              <p className="text-2xl font-semibold">{usage.remaining}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Processing Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Process New Video</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              YouTube URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || usage.remaining === 0}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  'Process Video'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Videos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Videos</h2>
        <div className="space-y-6">
          {recentVideos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No videos processed yet</p>
          ) : (
            recentVideos.map((video, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={video.info.thumbnailUrl}
                    alt={video.info.title}
                    className="w-32 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{video.info.title}</h3>
                    <p className="text-gray-500 mb-2">
                      Duration: {Math.floor(video.info.duration / 60)}m {video.info.duration % 60}s
                    </p>
                    <div className="space-y-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Summary
                        </summary>
                        <p className="mt-2 text-gray-600">{video.transcript.summary}</p>
                      </details>
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Chapters
                        </summary>
                        <div className="mt-2 space-y-2">
                          {video.transcript.chapters.map((chapter, idx) => (
                            <div key={idx}>
                              <h4 className="font-medium">{chapter.title}</h4>
                              <p className="text-gray-600">{chapter.content}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                      <div>
                        <span className="text-sm text-gray-500">Keywords: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {video.transcript.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
