'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface BatchStatus {
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export function BatchProcessor() {
  const [urls, setUrls] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchStatus, setBatchStatus] = useState<BatchStatus[]>([]);
  const { toast } = useToast();

  async function processBatch(e: React.FormEvent) {
    e.preventDefault();

    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.includes('youtube.com'));

    if (urlList.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid YouTube URLs (one per line)",
        variant: "destructive"
      });
      return;
    }

    if (urlList.length > 10) {
      toast({
        title: "Error",
        description: "Maximum 10 videos can be processed at once",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setBatchStatus(urlList.map(url => ({ url, status: 'pending' })));

    // Process videos sequentially to avoid overwhelming the server
    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      
      // Update status to processing
      setBatchStatus(prev => prev.map((status, index) => 
        index === i ? { ...status, status: 'processing' } : status
      ));

      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl: url }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to process video');
        }

        // Update status to completed
        setBatchStatus(prev => prev.map((status, index) => 
          index === i ? { ...status, status: 'completed' } : status
        ));
      } catch (error: any) {
        // Update status to failed
        setBatchStatus(prev => prev.map((status, index) => 
          index === i ? { 
            ...status, 
            status: 'failed',
            error: error.message 
          } : status
        ));
      }
    }

    setIsProcessing(false);
    
    // Show completion toast
    const completed = batchStatus.filter(s => s.status === 'completed').length;
    const failed = batchStatus.filter(s => s.status === 'failed').length;
    
    toast({
      title: "Batch Processing Complete",
      description: `Successfully processed ${completed} videos. ${failed} failed.`,
      variant: completed > 0 ? "default" : "destructive"
    });
  }

  const progress = (batchStatus.filter(
    s => s.status === 'completed' || s.status === 'failed'
  ).length / Math.max(batchStatus.length, 1)) * 100;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Batch Process Videos</h2>
      
      <form onSubmit={processBatch} className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">
            YouTube URLs (one per line, max 10)
          </label>
          <Textarea
            placeholder="https://youtube.com/watch?v=...\nhttps://youtube.com/watch?v=..."
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            disabled={isProcessing}
            rows={5}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Batch...
            </>
          ) : (
            'Start Batch Processing'
          )}
        </Button>
      </form>

      {batchStatus.length > 0 && (
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2">
            {batchStatus.map((status, index) => (
              <div 
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  {status.status === 'pending' && (
                    <div className="h-4 w-4 rounded-full bg-gray-200" />
                  )}
                  {status.status === 'processing' && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {status.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {status.status === 'failed' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="truncate max-w-[300px]">
                    {status.url}
                  </span>
                </div>
                <span className="capitalize">
                  {status.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Tips:</p>
        <ul className="list-disc list-inside">
          <li>Process up to 10 videos at once</li>
          <li>Each video counts towards your plan limit</li>
          <li>Processing time varies by video length</li>
        </ul>
      </div>
    </Card>
  );
}
