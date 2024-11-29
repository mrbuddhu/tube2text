'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { VideoProgress } from './VideoProgress';
import { EventType, trackEvent } from '@/lib/analytics';

export function ProcessVideo() {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const { toast } = useToast();

  async function processVideo(e: React.FormEvent) {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // Track video processing start
      trackEvent({
        type: EventType.VIDEO_PROCESSED,
        timestamp: new Date().toISOString(),
        data: {
          url,
          status: 'started',
          processingTime: 0
        }
      });

      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Track successful video processing
      trackEvent({
        type: EventType.VIDEO_PROCESSED,
        timestamp: new Date().toISOString(),
        data: {
          url,
          videoId: data.videoId,
          status: 'completed',
          processingTime: Date.now() - startTime,
          transcript: data.transcript
        }
      });

      setVideoId(data.videoId);
    } catch (error) {
      console.error('Error processing video:', error);
      
      // Track error
      trackEvent({
        type: EventType.ERROR,
        timestamp: new Date().toISOString(),
        data: {
          url,
          error: error instanceof Error ? error.message : 'Failed to process video',
          processingTime: Date.now() - startTime
        }
      });

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process video",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  }

  const handleComplete = (data: any) => {
    // Track content generation completion
    trackEvent({
      type: EventType.CONTENT_GENERATED,
      timestamp: new Date().toISOString(),
      data: {
        videoId: videoId,
        contentType: data.contentType,
        wordCount: data.content?.split(/\s+/).length || 0,
        characterCount: data.content?.length || 0
      }
    });

    setIsProcessing(false);
    setUrl('');
    setVideoId(null);
    toast({
      title: "Success",
      description: "Video processed successfully!",
    });
  };

  return (
    <Card className="p-4">
      <form onSubmit={processVideo} className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isProcessing}
          />
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              'Process'
            )}
          </Button>
        </div>

        {isProcessing && videoId && (
          <VideoProgress 
            videoId={videoId}
            onComplete={handleComplete}
          />
        )}
      </form>
    </Card>
  );
}
