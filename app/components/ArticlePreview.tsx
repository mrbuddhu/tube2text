'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ArticlePreviewProps {
  content: string;
  onSave?: (content: string) => void;
}

export default function ArticlePreview({ content, onSave }: ArticlePreviewProps) {
  const [editableContent, setEditableContent] = useState(content);
  const [format, setFormat] = useState<'txt' | 'md' | 'html'>('txt');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableContent);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const handleDownload = () => {
    let downloadContent = editableContent;
    let extension = 'txt';
    let contentType = 'text/plain';

    if (format === 'md') {
      downloadContent = `# YouTube Video Transcript\n\n${editableContent}`;
      extension = 'md';
      contentType = 'text/markdown';
    } else if (format === 'html') {
      downloadContent = `
<!DOCTYPE html>
<html>
<head>
  <title>YouTube Video Transcript</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    p { margin-bottom: 1em; }
  </style>
</head>
<body>
  <h1>YouTube Video Transcript</h1>
  ${editableContent.split('\n').map(para => `<p>${para}</p>`).join('\n')}
</body>
</html>`;
      extension = 'html';
      contentType = 'text/html';
    }

    const blob = new Blob([downloadContent], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'txt' | 'md' | 'html')}
            className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="txt">Plain Text</option>
            <option value="md">Markdown</option>
            <option value="html">HTML</option>
          </select>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
              copied
                ? 'text-green-700 bg-green-100 hover:bg-green-200'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {copied ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              )}
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <textarea
          value={editableContent}
          onChange={(e) => {
            setEditableContent(e.target.value);
            onSave?.(e.target.value);
          }}
          className="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Your transcribed text will appear here..."
        />
      </div>
    </div>
  );
}
