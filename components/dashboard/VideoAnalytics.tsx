'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getAnalytics, EventType } from '@/lib/analytics';

interface DailyStats {
  date: string;
  videos: number;
  characters: number;
}

interface ProcessingStats {
  date: string;
  processingTime: number;
  wordCount: number;
}

export function VideoAnalytics() {
  const { user } = useUser();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [processingStats, setProcessingStats] = useState<ProcessingStats[]>([]);
  const [topKeywords, setTopKeywords] = useState<{word: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function processAnalytics() {
      try {
        const analytics = getAnalytics();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Process daily stats
        const dailyMap = new Map<string, DailyStats>();
        const processMap = new Map<string, ProcessingStats>();
        const wordFrequency = new Map<string, number>();

        analytics.events.forEach(event => {
          const date = new Date(event.timestamp).toLocaleDateString();

          if (new Date(event.timestamp) < thirtyDaysAgo) return;

          // Process video events
          if (event.type === EventType.VIDEO_PROCESSED) {
            // Update daily stats
            const existing = dailyMap.get(date) || { date, videos: 0, characters: 0 };
            dailyMap.set(date, {
              date,
              videos: existing.videos + 1,
              characters: existing.characters + (event.data.transcript?.length || 0)
            });

            // Update processing stats
            const existingProcess = processMap.get(date) || { 
              date, 
              processingTime: 0,
              wordCount: 0 
            };
            processMap.set(date, {
              date,
              processingTime: existingProcess.processingTime + (event.data.processingTime || 0),
              wordCount: existingProcess.wordCount + (
                event.data.transcript?.split(/\s+/).length || 0
              )
            });

            // Update word frequency
            const words = event.data.transcript
              ?.toLowerCase()
              .split(/\W+/)
              .filter((word: string) => word.length > 3);
            
            words?.forEach((word: string) => {
              wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
            });
          }
        });

        // Convert to arrays and sort
        setDailyStats(Array.from(dailyMap.values()));
        setProcessingStats(Array.from(processMap.values()));
        setTopKeywords(
          Array.from(wordFrequency.entries())
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        );
        setError(null);
      } catch (err) {
        console.error('Error processing analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }

    processAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Video Processing Activity</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="videos" fill="#8884d8" name="Videos Processed" />
              <Bar yAxisId="right" dataKey="characters" fill="#82ca9d" name="Characters" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Processing Performance</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processingStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="processingTime" fill="#8884d8" name="Processing Time (ms)" />
              <Bar yAxisId="right" dataKey="wordCount" fill="#82ca9d" name="Word Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {topKeywords.map(({ word, count }) => (
            <div key={word} className="bg-gray-100 rounded p-2 text-sm">
              <span className="font-medium">{word}</span>
              <span className="text-gray-500 ml-2">({count})</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
