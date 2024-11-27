"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SignInModal from './SignInModal';
import ArticlePreview from './ArticlePreview';

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  content: string;
}

interface TranscriptMetadata {
  duration: number;
  wordCount: number;
  transcriptSegments: number;
  remainingFreeUses: number | null;
}

interface VideoInputProps {
  onTranscriptionComplete?: (transcription: string) => void;
}

export default function VideoInput({ onTranscriptionComplete }: VideoInputProps) {
  const [url, setUrl] = useState('');
  const [article, setArticle] = useState('');
  const [metadata, setMetadata] = useState<TranscriptMetadata | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { isAuthenticated, isPaidUser } = useAuth();

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
  };

  const saveToHistory = (content: string) => {
    if (typeof window === 'undefined') return;
    
    const history = JSON.parse(localStorage.getItem('tube2text_history') || '[]');
    const newItem = {
      id: Date.now().toString(),
      url,
      content,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [newItem, ...history].slice(0, 10);
    localStorage.setItem('tube2text_history', JSON.stringify(updatedHistory));
  };

  const handleTranscribe = async () => {
    if (!isAuthenticated) {
      setShowSignInModal(true);
      return;
    }

    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }

    setError('');
    setIsLoading(true);
    setArticle('');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setArticle(data.content);
      setMetadata(data.metadata);
      onTranscriptionComplete?.(data.content);
      
      // Show success message
      setError('Transcription completed successfully!');
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={(e) => { e.preventDefault(); handleTranscribe(); }} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            YouTube Video URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Converting...' : 'Convert to Text'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-md bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {metadata && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Video Information</h3>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Duration:</span>
              <br />
              {formatDuration(metadata.duration)}
            </div>
            <div>
              <span className="font-medium">Word Count:</span>
              <br />
              {metadata.wordCount.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Segments:</span>
              <br />
              {metadata.transcriptSegments}
            </div>
          </div>
        </div>
      )}

      {article && (
        <ArticlePreview 
          content={article}
          onSave={(content) => {
            setArticle(content);
            saveToHistory(content);
          }}
        />
      )}

      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
      />
    </div>
  );
}
