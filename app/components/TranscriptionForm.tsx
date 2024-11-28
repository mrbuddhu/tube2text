'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FileText, Loader2, Download } from 'lucide-react';
import { Share2 } from 'lucide-react';
import { WaitlistIncentive } from './WaitlistIncentive';
import { EarlyBirdOffer } from './EarlyBirdOffer';

interface TranscriptionProgress {
  status: 'downloading' | 'transcribing' | 'complete' | 'error';
  progress: number;
  message?: string;
}

interface TranscriptionResult {
  text: string;
  language?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  chapters?: Array<{
    title: string;
    start: number;
    end: number;
    content: string;
  }>;
  keywords?: string[];
  summary?: string;
  cached?: boolean;
  videoId: string;
}

export function TranscriptionForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<TranscriptionProgress | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { isAuthenticated } = useAuth();

  // Poll for progress updates
  useEffect(() => {
    if (!isLoading || !result?.videoId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/transcribe?videoId=${result.videoId}`);
        if (response.ok) {
          const progressData = await response.json();
          setProgress(progressData);
          
          if (progressData.status === 'complete' || progressData.status === 'error') {
            clearInterval(pollInterval);
            if (progressData.status === 'complete') {
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('Error polling progress:', error);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isLoading, result?.videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please login to use this feature');
      return;
    }

    setIsLoading(true);
    setProgress(null);
    setResult(null);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to transcribe video');
      }

      const data = await response.json();
      setResult(data);
      
      if (data.cached) {
        setIsLoading(false);
        toast.success('Retrieved from cache!');
      } else {
        toast.success('Processing started! You can wait or come back later.');
      }
      
      setUrl('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to transcribe video. Please try again.');
      setIsLoading(false);
    }
  };

  const downloadTranscript = (format: 'txt' | 'srt') => {
    if (!result?.text) return;

    let content = result.text;
    if (format === 'srt' && result.segments) {
      content = result.segments.map((seg, i) => {
        const start = new Date(seg.start * 1000).toISOString().substr(11, 12);
        const end = new Date(seg.end * 1000).toISOString().substr(11, 12);
        return `${i + 1}\n${start} --> ${end}\n${seg.text}\n\n`;
      }).join('');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number): string => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(11, 8);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-semibold">Convert Video to Article</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            YouTube Video URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://www.youtube.com/watch?v=..."
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{progress?.message || 'Processing...'}</span>
            </>
          ) : (
            <span>Convert to Article</span>
          )}
        </button>

        {progress && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress.message}</p>
          </div>
        )}

        {result?.text && (
          <div className="mt-6 space-y-6">
            {result.summary && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.summary}</p>
                </div>
              </div>
            )}

            {result.keywords && result.keywords.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.chapters && result.chapters.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Chapters</h3>
                <div className="space-y-4">
                  {result.chapters.map((chapter, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-blue-900">{chapter.title}</h4>
                        <span className="text-sm text-gray-500">
                          {formatTime(chapter.start)} - {formatTime(chapter.end)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{chapter.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Full Transcript</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{result.text}</pre>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => downloadTranscript('txt')}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Download TXT</span>
                </button>
                
                {result.segments && (
                  <button
                    onClick={() => downloadTranscript('srt')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download SRT</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 text-center mt-4">
          Supported formats: TXT, SRT (with timestamps)
        </div>
      </form>

      {showUpgradeModal && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-lg font-medium text-yellow-900">Join the Waitlist</h3>
          <p className="mt-2 text-sm text-yellow-700">
            We're currently in early access. Join our waitlist to be notified when we launch!
          </p>
          <div className="mt-4 flex space-x-4">
            <WaitlistIncentive />
            <EarlyBirdOffer />
          </div>
        </div>
      )}
    </div>
  );
}
