'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check, AlertCircle, Clock } from 'lucide-react';

interface VideoProgressProps {
  videoId: string;
  onComplete?: (data: any) => void;
}

export function VideoProgress({ videoId, onComplete }: VideoProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'processing' | 'completed' | 'error'>('processing');
  const { toast } = useToast();

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/process/status?videoId=${videoId}`);
        const data = await response.json();

        if (data.error) {
          setStatus('error');
          toast({
            title: 'Error',
            description: data.error,
            variant: 'destructive',
          });
          return;
        }

        setProgress(data.progress);
        
        if (data.status === 'completed') {
          setStatus('completed');
          onComplete?.(data);
        } else if (data.status === 'processing') {
          // Continue polling
          setTimeout(checkProgress, 2000);
        }
      } catch (error) {
        console.error('Error checking progress:', error);
        setStatus('error');
      }
    };

    checkProgress();
  }, [videoId, onComplete, toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status === 'processing' && (
            <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
          )}
          {status === 'completed' && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          {status === 'error' && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <Badge variant={
            status === 'completed' ? 'success' :
            status === 'error' ? 'destructive' :
            'default'
          }>
            {status === 'processing' ? 'Processing' :
             status === 'completed' ? 'Completed' :
             'Error'}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {progress}%
        </span>
      </div>
      
      <Progress value={progress} className="w-full" />
      
      {status === 'error' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      )}
    </div>
  );
}
