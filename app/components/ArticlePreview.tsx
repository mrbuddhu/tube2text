"use client";

import { useState } from 'react';

interface ArticlePreviewProps {
  content: string;
  onSave?: (content: string) => void;
}

export default function ArticlePreview({ content, onSave }: ArticlePreviewProps) {
  const [editableContent, setEditableContent] = useState(content);
  const [format, setFormat] = useState<'txt' | 'md' | 'html'>('txt');

  const handleDownload = () => {
    let downloadContent = editableContent;
    let extension = 'txt';

    if (format === 'md') {
      downloadContent = `# YouTube Video Transcript\n\n${editableContent}`;
      extension = 'md';
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
  ${editableContent.split('\n\n').map(p => `<p>${p}</p>`).join('\n')}
</body>
</html>`;
      extension = 'html';
    }

    const blob = new Blob([downloadContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    // Could add a toast notification here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4 flex justify-between items-center">
        <div className="space-x-2">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'txt' | 'md' | 'html')}
            className="rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="txt">Plain Text</option>
            <option value="md">Markdown</option>
            <option value="html">HTML</option>
          </select>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Download
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Copy to Clipboard
          </button>
        </div>
        {onSave && (
          <button
            onClick={() => onSave(editableContent)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save Changes
          </button>
        )}
      </div>
      <textarea
        value={editableContent}
        onChange={(e) => setEditableContent(e.target.value)}
        className="w-full h-96 p-4 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
        style={{ lineHeight: '1.6' }}
      />
    </div>
  );
}
