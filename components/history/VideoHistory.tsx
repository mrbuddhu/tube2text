import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Copy } from 'lucide-react';
import { historyManager, VideoHistory } from '@/lib/history';
import { useToast } from '@/components/ui/use-toast';

export function VideoHistoryComponent() {
  const [history, setHistory] = useState<VideoHistory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setHistory(historyManager.getHistory());
  }, []);

  const handleDelete = (id: string) => {
    historyManager.deleteVideo(id);
    setHistory(historyManager.getHistory());
    toast({
      title: "Video deleted from history",
      description: "The video has been removed from your history.",
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Content copied",
      description: "The content has been copied to your clipboard.",
    });
  };

  if (history.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No videos in history yet. Process some videos to see them here!
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((video) => (
        <Card key={video.id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(video.timestamp).toLocaleString()}
              </p>
              <div className="flex space-x-2">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Video</span>
                </a>
                {video.article && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(video.article!)}
                    className="text-sm"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Article
                  </Button>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(video.id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
