'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { useToast } from '../ui/use-toast';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  extension: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'Export as formatted markdown text',
    extension: '.md'
  },
  {
    id: 'txt',
    name: 'Plain Text',
    description: 'Simple text format',
    extension: '.txt'
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data format',
    extension: '.json'
  },
  {
    id: 'docx',
    name: 'Word Document',
    description: 'Microsoft Word compatible format',
    extension: '.docx'
  }
];

export const ExportOptions = () => {
  const { userId } = useAuth();
  const { addToast } = useToast();
  const [exporting, setExporting] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState<string>('markdown');

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) throw error;

      if (!videos.length) {
        addToast({
          title: 'No Content',
          description: 'No completed videos found to export',
          type: 'warning'
        });
        return;
      }

      // Prepare export data
      const exportData = videos.map(video => ({
        title: video.title,
        content: video.content,
        url: video.url,
        created_at: video.created_at
      }));

      // Generate export file
      const format = exportFormats.find(f => f.id === selectedFormat);
      const filename = `tube2text_export_${new Date().toISOString()}${format?.extension}`;
      
      let content = '';
      switch (selectedFormat) {
        case 'markdown':
          content = exportData.map(video => (
            `# ${video.title}\n\n${video.content}\n\nSource: ${video.url}\nDate: ${new Date(video.created_at).toLocaleDateString()}\n\n---\n\n`
          )).join('');
          break;
        case 'txt':
          content = exportData.map(video => (
            `${video.title}\n\n${video.content}\n\nSource: ${video.url}\nDate: ${new Date(video.created_at).toLocaleDateString()}\n\n==========\n\n`
          )).join('');
          break;
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Create download link
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast({
        title: 'Success',
        description: 'Content exported successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error exporting content:', error);
      addToast({
        title: 'Error',
        description: 'Failed to export content',
        type: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportFormats.map((format) => (
              <div
                key={format.id}
                className={`
                  p-4 rounded-lg cursor-pointer border-2 transition-colors
                  ${selectedFormat === format.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }
                `}
                onClick={() => setSelectedFormat(format.id)}
              >
                <h3 className="font-medium">{format.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format.description}
                </p>
              </div>
            ))}
          </div>

          <Alert>
            Only completed videos will be included in the export.
          </Alert>

          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export Content'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
