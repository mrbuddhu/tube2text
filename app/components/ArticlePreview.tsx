'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { ClipboardIcon, DocumentArrowDownIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ArticlePreviewProps {
  content: string;
  videoId?: string;
  metadata?: {
    wordCount: number;
    readingTime: number;
  };
}

export default function ArticlePreview({ content, videoId, metadata }: ArticlePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const handleDownload = (format: 'txt' | 'md' | 'html') => {
    try {
      const element = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `article.${format}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  if (!content) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {videoId && (
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-[400px]"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Metadata Section */}
          {metadata && (
            <div className="flex items-center space-x-6 text-sm text-gray-500 border-b border-gray-200 pb-4">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                <span>{metadata.wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span>{metadata.readingTime} min read</span>
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Enhanced Article</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ClipboardIcon className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <div className="relative inline-block">
                <button
                  onClick={() => handleDownload('md')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="prose prose-sm max-w-none mt-4">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-6">{children}</h2>,
                p: ({ children }) => <p className="mb-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
