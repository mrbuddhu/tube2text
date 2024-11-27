'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface VideoInputProps {
  onTranscriptionComplete?: (transcription: string) => void;
}

export default function VideoInput({ onTranscriptionComplete }: VideoInputProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const validateYouTubeUrl = (url: string) => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/
    ];

    return patterns.some(pattern => pattern.test(url));
  };

  const handleTranscribe = async () => {
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(url)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          isPaidUser: session?.user?.email?.endsWith('@gmail.com') || false // Example paid user check
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      onTranscriptionComplete?.(data.content);
      toast.success('Transcription completed successfully!');
    } catch (err) {
      console.error('Transcription error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to process video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                YouTube Video URL
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="url"
                  className="block w-full pr-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Make sure the video has closed captions enabled
              </p>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleTranscribe}
                disabled={isLoading || !url}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isLoading || !url
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Convert to Article'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
