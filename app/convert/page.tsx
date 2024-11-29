'use client';

import { useState } from 'react';
import { useSubscription } from '@/context/subscription-context';
import { FeatureGate } from '@/components/subscription/feature-gate';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { logger } from '@/lib/logger';
import { historyManager } from '@/lib/history';
import { VideoHistoryComponent } from '@/components/history/VideoHistory';
import { ContentEditor } from '@/components/content/ContentEditor';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ProcessingStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  result?: {
    transcription?: string;
    article?: string;
    socialPosts?: string[];
  };
  error?: string;
}

export default function ConvertPage() {
  const { conversionsRemaining, tier, limits } = useSubscription();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    result: {
      transcription: '',
      article: '',
      socialPosts: []
    }
  });
  const { isSignedIn, user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      logger.log('Starting video processing', { url });
      
      // Show initial progress
      setProgress(10);
      
      // Basic YouTube URL validation
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(url)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid YouTube URL",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Make API call
      const response = await axios.post('/api/convert', { url });
      
      clearInterval(interval);
      setProgress(100);

      if (response.data) {
        setProcessing({
          status: 'success',
          progress: 100,
          result: response.data
        });

        // Save to history
        historyManager.saveVideo({
          url,
          title: response.data.title || 'Untitled Video',
          article: response.data.article,
          socialPosts: response.data.socialPosts
        });

        logger.log('Video processing completed', { url });
        
        toast({
          title: "Success!",
          description: "Your video has been processed successfully.",
        });
      }
    } catch (error: any) {
      logger.error('Video processing failed', error);
      
      setProcessing({
        status: 'error',
        progress: 0,
        error: error.message || 'Failed to process the video. Please try again.'
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to process the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Please sign in to continue</h1>
            <p className="mt-4 text-gray-600">You need to be signed in to use the conversion feature.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Convert Video</h1>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Conversions Remaining: {conversionsRemaining}</AlertTitle>
          <AlertDescription>
            Your {tier} plan allows videos up to {limits.maxVideoLength} minutes.
          </AlertDescription>
        </Alert>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="url"
              placeholder="Enter YouTube URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isProcessing || !url}>
              {isProcessing ? 'Converting...' : 'Convert'}
            </Button>
          </div>
          {isProcessing && (
            <Progress value={progress} className="w-full" />
          )}
        </form>
      </Card>

      <Tabs defaultValue="article" className="space-y-4">
        <TabsList>
          <TabsTrigger value="article">Article</TabsTrigger>
          <TabsTrigger value="social">Social Posts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="article" className="mt-4">
          {processing.status === 'success' && processing.result ? (
            <ContentEditor
              content={{
                videoId: url,
                title: processing.result.title || '',
                transcript: processing.result.transcript || '',
                summary: processing.result.summary || '',
                article: processing.result.article || '',
                socialPosts: {
                  twitter: processing.result.socialPosts?.[0] || '',
                  linkedin: processing.result.socialPosts?.[1] || '',
                  facebook: processing.result.socialPosts?.[2] || ''
                },
                metadata: {
                  processedAt: new Date().toISOString(),
                  duration: processing.result.duration || '',
                  language: processing.result.language || 'en'
                }
              }}
              onUpdate={(updatedContent) => {
                setProcessing({
                  ...processing,
                  result: {
                    ...processing.result,
                    article: updatedContent.article,
                    socialPosts: [
                      updatedContent.socialPosts.twitter,
                      updatedContent.socialPosts.linkedin,
                      updatedContent.socialPosts.facebook
                    ]
                  }
                });
              }}
            />
          ) : (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                Process a video to see the generated content
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="social">
          {processing.status === 'success' && processing.result ? (
            <ContentEditor
              content={{
                videoId: url,
                title: processing.result.title || '',
                transcript: processing.result.transcript || '',
                summary: processing.result.summary || '',
                article: processing.result.article || '',
                socialPosts: {
                  twitter: processing.result.socialPosts?.[0] || '',
                  linkedin: processing.result.socialPosts?.[1] || '',
                  facebook: processing.result.socialPosts?.[2] || ''
                },
                metadata: {
                  processedAt: new Date().toISOString(),
                  duration: processing.result.duration || '',
                  language: processing.result.language || 'en'
                }
              }}
              onUpdate={(updatedContent) => {
                setProcessing({
                  ...processing,
                  result: {
                    ...processing.result,
                    article: updatedContent.article,
                    socialPosts: [
                      updatedContent.socialPosts.twitter,
                      updatedContent.socialPosts.linkedin,
                      updatedContent.socialPosts.facebook
                    ]
                  }
                });
              }}
            />
          ) : (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                Process a video to see the generated social media posts
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <VideoHistoryComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
