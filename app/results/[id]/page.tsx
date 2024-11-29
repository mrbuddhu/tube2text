'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Download, Copy, Share2 } from "lucide-react";

interface TranscriptionResult {
  id: string;
  title: string;
  url: string;
  transcript: string;
  summary: string;
  keywords: string[];
  processedAt: string;
}

export default function ResultsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/history/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch result');
        }
        const data = await response.json();
        setResult(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load transcription result",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [params.id, toast]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (format: 'txt' | 'md' | 'html') => {
    if (!result) return;

    let content = '';
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}`;

    switch (format) {
      case 'txt':
        content = `${result.title}\n\nTranscript:\n${result.transcript}\n\nSummary:\n${result.summary}\n\nKeywords:\n${result.keywords.join(', ')}`;
        filename += '.txt';
        break;
      case 'md':
        content = `# ${result.title}\n\n## Transcript\n${result.transcript}\n\n## Summary\n${result.summary}\n\n## Keywords\n${result.keywords.join(', ')}`;
        filename += '.md';
        break;
      case 'html':
        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${result.title}</title>
            <style>
              body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
              h1 { color: #2563eb; }
              h2 { color: #4b5563; margin-top: 2rem; }
            </style>
          </head>
          <body>
            <h1>${result.title}</h1>
            <h2>Transcript</h2>
            <p>${result.transcript}</p>
            <h2>Summary</h2>
            <p>${result.summary}</p>
            <h2>Keywords</h2>
            <p>${result.keywords.join(', ')}</p>
          </body>
          </html>
        `;
        filename += '.html';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white">Result not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{result.title}</CardTitle>
            <CardDescription className="text-gray-400">
              Processed on {new Date(result.processedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button
                variant="outline"
                className="bg-white/5"
                onClick={() => handleCopy(result.transcript)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                className="bg-white/5"
                onClick={() => handleDownload('txt')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download TXT
              </Button>
              <Button
                variant="outline"
                className="bg-white/5"
                onClick={() => handleDownload('md')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download MD
              </Button>
              <Button
                variant="outline"
                className="bg-white/5"
                onClick={() => handleDownload('html')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
              <Button
                variant="outline"
                className="bg-white/5"
                onClick={() => handleCopy(window.location.href)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="w-full bg-white/5">
                <TabsTrigger value="transcript" className="flex-1">Transcript</TabsTrigger>
                <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
                <TabsTrigger value="keywords" className="flex-1">Keywords</TabsTrigger>
              </TabsList>
              <TabsContent value="transcript" className="mt-4">
                <div className="bg-white/5 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                  {result.transcript}
                </div>
              </TabsContent>
              <TabsContent value="summary" className="mt-4">
                <div className="bg-white/5 rounded-lg p-4 text-gray-300">
                  {result.summary}
                </div>
              </TabsContent>
              <TabsContent value="keywords" className="mt-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
