'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { VideoProgress } from './VideoProgress';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface VideoInput {
  id: string;
  url: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
}

export function BatchUpload() {
  const [videos, setVideos] = useState<VideoInput[]>([{ id: '1', url: '', status: 'idle' }]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const addVideo = () => {
    setVideos([...videos, { 
      id: Math.random().toString(36).substr(2, 9),
      url: '', 
      status: 'idle' 
    }]);
  };

  const removeVideo = (id: string) => {
    setVideos(videos.filter(video => video.id !== id));
  };

  const updateVideoUrl = (id: string, url: string) => {
    setVideos(videos.map(video => 
      video.id === id ? { ...video, url } : video
    ));
  };

  const handleSubmit = async () => {
    const nonEmptyVideos = videos.filter(v => v.url.trim());
    
    if (nonEmptyVideos.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one video URL',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // Start processing all videos
      setVideos(videos.map(video => 
        video.url.trim() ? { ...video, status: 'processing' } : video
      ));

      // Process each video
      for (const video of nonEmptyVideos) {
        const response = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: video.url }),
        });

        const data = await response.json();

        if (data.error) {
          setVideos(prev => prev.map(v => 
            v.id === video.id ? { ...v, status: 'error' } : v
          ));
          continue;
        }

        // Update video with processing ID
        setVideos(prev => prev.map(v => 
          v.id === video.id ? { ...v, id: data.videoId } : v
        ));
      }
    } catch (error) {
      console.error('Error processing videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to process videos',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {videos.map((video, index) => (
        <Card key={video.id} className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter YouTube URL"
                value={video.url}
                onChange={(e) => updateVideoUrl(video.id, e.target.value)}
                disabled={video.status === 'processing'}
              />
              {videos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVideo(video.id)}
                  disabled={video.status === 'processing'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {video.status === 'processing' && (
              <VideoProgress 
                videoId={video.id}
                onComplete={() => {
                  setVideos(prev => prev.map(v => 
                    v.id === video.id ? { ...v, status: 'completed' } : v
                  ));
                }}
              />
            )}
          </div>
        </Card>
      ))}

      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={addVideo}
          disabled={processing}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={processing || !videos.some(v => v.url.trim())}
        >
          {processing ? 'Processing...' : 'Process All'}
        </Button>
      </div>
    </div>
  );
}
