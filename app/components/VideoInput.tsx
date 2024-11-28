'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function VideoInput({ onTranscriptReady }: { onTranscriptReady: (data: any) => void }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (!session) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Processing your video...');

    try {
      // Step 1: Get the transcript
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!transcribeResponse.ok) {
        throw new Error('Failed to transcribe video');
      }

      const transcribeData = await transcribeResponse.json();

      // Step 2: Enhance and format the transcript
      const enhanceResponse = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcribeData.transcript,
          enhance: true,
          format: 'md'
        }),
      });

      if (!enhanceResponse.ok) {
        throw new Error('Failed to enhance transcript');
      }

      const enhancedData = await enhanceResponse.json();
      
      // Step 3: Send the final result back
      onTranscriptReady({
        ...enhancedData,
        videoId: transcribeData.videoId,
        url: url
      });

      toast.success('Article ready!', { id: loadingToast });
      setUrl('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process video', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="url" className="text-sm font-medium text-gray-700">
            YouTube Video URL
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Convert to Article'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
