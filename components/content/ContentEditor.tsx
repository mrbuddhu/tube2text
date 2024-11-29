'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Download, Copy, Wand2 } from 'lucide-react';
import { WritingStyle, getWritingStyles, applyWritingStyle } from '@/lib/writingStyles';
import { exportToMarkdown, exportToJSON, exportToText, exportToCSV, ExportData } from '@/lib/export';

interface ContentEditorProps {
  content: ExportData;
  onUpdate?: (content: ExportData) => void;
}

export function ContentEditor({ content, onUpdate }: ContentEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle | null>(null);
  const [styles, setStyles] = useState<WritingStyle[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setStyles(getWritingStyles());
  }, []);

  const handleApplyStyle = () => {
    if (!selectedStyle) return;

    const updatedContent = {
      ...editedContent,
      article: applyWritingStyle(editedContent.article, selectedStyle),
      socialPosts: {
        twitter: applyWritingStyle(editedContent.socialPosts.twitter, selectedStyle),
        linkedin: applyWritingStyle(editedContent.socialPosts.linkedin, selectedStyle),
        facebook: applyWritingStyle(editedContent.socialPosts.facebook, selectedStyle)
      }
    };

    setEditedContent(updatedContent);
    onUpdate?.(updatedContent);

    toast({
      title: "Style Applied",
      description: `Applied ${selectedStyle.name} style to your content.`,
    });
  };

  const handleExport = (format: 'markdown' | 'json' | 'text' | 'csv') => {
    try {
      let exportedContent = '';
      let filename = '';
      let mimeType = '';

      switch (format) {
        case 'markdown':
          exportedContent = exportToMarkdown(editedContent);
          filename = 'content.md';
          mimeType = 'text/markdown';
          break;
        case 'json':
          exportedContent = exportToJSON(editedContent);
          filename = 'content.json';
          mimeType = 'application/json';
          break;
        case 'text':
          exportedContent = exportToText(editedContent);
          filename = 'content.txt';
          mimeType = 'text/plain';
          break;
        case 'csv':
          exportedContent = exportToCSV(editedContent);
          filename = 'content.csv';
          mimeType = 'text/csv';
          break;
      }

      // Create download link
      const blob = new Blob([exportedContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Content Exported",
        description: `Your content has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Style Selector */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <select
            className="flex-1 p-2 border rounded-md"
            value={selectedStyle?.id || ''}
            onChange={(e) => setSelectedStyle(styles.find(s => s.id === e.target.value) || null)}
          >
            <option value="">Select a Writing Style</option>
            {styles.map(style => (
              <option key={style.id} value={style.id}>
                {style.name} - {style.description}
              </option>
            ))}
          </select>
          <Button
            onClick={handleApplyStyle}
            disabled={!selectedStyle}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Apply Style
          </Button>
        </div>
      </Card>

      {/* Content Editor */}
      <Tabs defaultValue="article">
        <TabsList>
          <TabsTrigger value="article">Article</TabsTrigger>
          <TabsTrigger value="social">Social Posts</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="article">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(editedContent.article)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <textarea
                className="w-full h-[400px] p-4 border rounded-md font-mono text-sm"
                value={editedContent.article}
                onChange={(e) => {
                  const updated = { ...editedContent, article: e.target.value };
                  setEditedContent(updated);
                  onUpdate?.(updated);
                }}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="p-4 space-y-6">
            {/* Twitter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Twitter/X Post</h3>
                <Button
                  variant="outline"
                  onClick={() => handleCopy(editedContent.socialPosts.twitter)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <textarea
                className="w-full h-[100px] p-2 border rounded-md"
                value={editedContent.socialPosts.twitter}
                onChange={(e) => {
                  const updated = {
                    ...editedContent,
                    socialPosts: {
                      ...editedContent.socialPosts,
                      twitter: e.target.value
                    }
                  };
                  setEditedContent(updated);
                  onUpdate?.(updated);
                }}
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">LinkedIn Post</h3>
                <Button
                  variant="outline"
                  onClick={() => handleCopy(editedContent.socialPosts.linkedin)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <textarea
                className="w-full h-[150px] p-2 border rounded-md"
                value={editedContent.socialPosts.linkedin}
                onChange={(e) => {
                  const updated = {
                    ...editedContent,
                    socialPosts: {
                      ...editedContent.socialPosts,
                      linkedin: e.target.value
                    }
                  };
                  setEditedContent(updated);
                  onUpdate?.(updated);
                }}
              />
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Facebook Post</h3>
                <Button
                  variant="outline"
                  onClick={() => handleCopy(editedContent.socialPosts.facebook)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <textarea
                className="w-full h-[150px] p-2 border rounded-md"
                value={editedContent.socialPosts.facebook}
                onChange={(e) => {
                  const updated = {
                    ...editedContent,
                    socialPosts: {
                      ...editedContent.socialPosts,
                      facebook: e.target.value
                    }
                  };
                  setEditedContent(updated);
                  onUpdate?.(updated);
                }}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Export Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleExport('markdown')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as Markdown
                </Button>
                <Button onClick={() => handleExport('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button onClick={() => handleExport('text')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as Text
                </Button>
                <Button onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
