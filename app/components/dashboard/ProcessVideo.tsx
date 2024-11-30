'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { useToast } from '../ui/use-toast';
import { useAuth } from '@clerk/nextjs';
import { useCredits } from '@/app/hooks/useCredits';
import { supabase } from '@/lib/supabase';

export const ProcessVideo = () => {
  const { userId } = useAuth();
  const { addToast } = useToast();
  const { credits, useCredits, refetchCredits } = useCredits();
  const [url, setUrl] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setProcessing(true);
    try {
      // Try to use 1 credit
      const success = await useCredits(1);
      if (!success) {
        addToast({
          title: 'Insufficient Credits',
          description: 'Please purchase more credits to continue.',
          variant: 'destructive',
        });
        return;
      }

      // Create video record
      const { data, error } = await supabase
        .from('videos')
        .insert([
          {
            url,
            user_id: userId,
            status: 'processing',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Trigger video processing
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: data.id,
          url,
        }),
      });

      if (!response.ok) {
        // Refund credit if processing fails
        await refetchCredits();
        throw new Error('Failed to process video');
      }

      addToast({
        title: 'Success',
        description: 'Video processing started',
        variant: 'default',
      });

      setUrl('');
    } catch (error) {
      console.error('Error processing video:', error);
      addToast({
        title: 'Error',
        description: 'Failed to process video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process New Video</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="url" className="text-sm font-medium text-gray-700">
                YouTube URL
              </label>
              <span className="text-sm text-gray-500">
                Credits: {credits}
              </span>
            </div>
            <Input
              id="url"
              type="url"
              placeholder="Enter YouTube URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={processing || credits === 0}
              className="w-full"
            />
          </div>
          
          {credits === 0 && (
            <Alert variant="warning" className="mt-4">
              You have no credits left. Please upgrade your plan to continue processing videos.
            </Alert>
          )}

          <Button
            type="submit"
            disabled={processing || !url || credits === 0}
            className="w-full"
          >
            {processing ? 'Processing...' : 'Process Video'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
