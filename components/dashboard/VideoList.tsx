'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseAdmin } from '@/lib/supabase';
import { useUser } from "@clerk/nextjs";
import { Download, ExternalLink, Copy } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  url: string;
  transcript: string;
  summary: string;
  article: string;
  social_post: string;
  hashtags: string[];
  created_at: string;
}

export function VideoList() {
  const { user } = useUser();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchVideos();
    }
  }, [user?.id]);

  async function fetchVideos() {
    const { data, error } = await supabaseAdmin
      .from('transcriptions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return;
    }

    setVideos(data || []);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  }

  function downloadAsFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Videos</h2>

      {videos.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No videos processed yet. Start by adding a YouTube URL!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline">
                      {new Date(video.created_at).toLocaleDateString()}
                    </Badge>
                    <Badge variant="outline">
                      {video.transcript.length} characters
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(video.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Video
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/* Transcript */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Transcript</h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(video.transcript)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsFile(video.transcript, `${video.title}-transcript.txt`)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Article */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Article</h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(video.article)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsFile(video.article, `${video.title}-article.txt`)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Social Post */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Social Post</h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${video.social_post}\n\n${video.hashtags.join(' ')}`)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
