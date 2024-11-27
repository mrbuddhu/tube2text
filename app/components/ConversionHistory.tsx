"use client";

import { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  content: string;
}

export default function ConversionHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('tube2text_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('tube2text_history');
    setHistory([]);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Recent Conversions</h2>
        <button
          onClick={clearHistory}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Clear History
        </button>
      </div>
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.url}</p>
            <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
