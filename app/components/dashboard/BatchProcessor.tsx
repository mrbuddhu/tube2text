'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { useToast } from '../ui/use-toast';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export const BatchProcessor = () => {
  const { userId } = useAuth();
  const { addToast } = useToast();
  const [urls, setUrls] = React.useState<string[]>(['']);
  const [processing, setProcessing] = React.useState(false);

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = urls.filter(url => url.trim());
    if (validUrls.length === 0) return;

    setProcessing(true);
    try {
      // Check credits
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!user?.credits || user.credits < validUrls.length) {
        addToast({
          title: 'Error',
          description: 'Insufficient credits for batch processing',
          type: 'error',
        });
        return;
      }

      // Process each URL
      const promises = validUrls.map(async (url) => {
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

        return fetch('/api/process-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId: data.id,
            url,
          }),
        });
      });

      await Promise.all(promises);

      addToast({
        title: 'Success',
        description: `Started processing ${validUrls.length} videos`,
        type: 'success',
      });

      setUrls(['']);
    } catch (error) {
      console.error('Error in batch processing:', error);
      addToast({
        title: 'Error',
        description: 'Failed to process some videos',
        type: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Process Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter YouTube URL"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                required
              />
              {urls.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeUrlField(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={addUrlField}
            >
              Add URL
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Processing...' : 'Process All'}
            </Button>
          </div>
          <Alert>
            Each video will consume one credit. Make sure you have enough credits
            for batch processing.
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
};
