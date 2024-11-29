'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { VideoList } from "@/components/dashboard/VideoList";
import { UsageStats } from "@/components/dashboard/UsageStats";
import { ProcessVideo } from "@/components/dashboard/ProcessVideo";
import { VideoAnalytics } from "@/components/dashboard/VideoAnalytics";
import { BatchProcessor } from "@/components/dashboard/BatchProcessor";
import { ExportOptions } from "@/components/dashboard/ExportOptions";
import { VideoCategories } from "@/components/dashboard/VideoCategories";
import { ResourceMonitor } from "@/components/dashboard/ResourceMonitor";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [usage, setUsage] = useState<UsageStats>({ used: 0, limit: 5, remaining: 5 });
  const [recentVideos, setRecentVideos] = useState<ProcessedVideo[]>([]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to access the dashboard.</div>;
  }

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
    <div className="container mx-auto p-6">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="batch">Batch Process</TabsTrigger>
          <TabsTrigger value="process">Process Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ResourceMonitor />
            <UsageStats />
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <Card className="p-6">
            <VideoList />
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="p-6">
            <VideoAnalytics />
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card className="p-6">
            <BatchProcessor />
          </Card>
        </TabsContent>

        <TabsContent value="process">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <ProcessVideo />
            </Card>
            <Card className="p-6">
              <ExportOptions />
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <VideoCategories />
            </Card>
          </div>
          <form onSubmit={handleSubmit}>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter YouTube URL" />
            <button type="submit" disabled={isProcessing}>Process Video</button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
