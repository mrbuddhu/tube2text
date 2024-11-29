'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Download, FileJson, FileText, Share2 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { useUser } from "@clerk/nextjs";

interface ExportOptions {
  transcripts: boolean;
  summaries: boolean;
  articles: boolean;
  socialPosts: boolean;
  analytics: boolean;
}

export function ExportOptions() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    transcripts: true,
    summaries: true,
    articles: true,
    socialPosts: true,
    analytics: false
  });

  async function exportData() {
    if (!user) return;
    setIsExporting(true);

    try {
      // Fetch user's videos
      const { data: videos } = await supabaseAdmin
        .from('transcriptions')
        .select('*')
        .eq('user_id', user.id);

      if (!videos) {
        throw new Error('No videos found');
      }

      // Prepare export data
      const exportData: any = {
        metadata: {
          exportDate: new Date().toISOString(),
          userId: user.id,
          totalVideos: videos.length
        },
        data: {}
      };

      if (options.transcripts) {
        exportData.data.transcripts = videos.map(v => ({
          videoId: v.id,
          title: v.title,
          transcript: v.transcript
        }));
      }

      if (options.summaries) {
        exportData.data.summaries = videos.map(v => ({
          videoId: v.id,
          title: v.title,
          summary: v.summary
        }));
      }

      if (options.articles) {
        exportData.data.articles = videos.map(v => ({
          videoId: v.id,
          title: v.title,
          article: v.article
        }));
      }

      if (options.socialPosts) {
        exportData.data.socialPosts = videos.map(v => ({
          videoId: v.id,
          title: v.title,
          post: v.social_post,
          hashtags: v.hashtags
        }));
      }

      if (options.analytics) {
        const { data: stats } = await supabaseAdmin
          .from('usage_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        exportData.data.analytics = stats;
      }

      // Generate export files
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);

      // Also create a CSV for transcripts if selected
      let csvUrl;
      if (options.transcripts) {
        const csvContent = videos.map(v => 
          `"${v.title.replace(/"/g, '""')}","${v.transcript.replace(/"/g, '""')}"`
        ).join('\n');
        const csvBlob = new Blob([`Title,Transcript\n${csvContent}`], { type: 'text/csv' });
        csvUrl = URL.createObjectURL(csvBlob);
      }

      // Download files
      const a = document.createElement('a');
      a.href = jsonUrl;
      a.download = `tube2text-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      if (csvUrl) {
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `tube2text-transcripts-${new Date().toISOString().split('T')[0]}.csv`;
        setTimeout(() => csvLink.click(), 100);
      }

      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully"
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Export Data</h2>
        <Button
          onClick={exportData}
          disabled={isExporting}
          className="flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="transcripts"
            checked={options.transcripts}
            onCheckedChange={(checked) => 
              setOptions(prev => ({ ...prev, transcripts: checked as boolean }))}
          />
          <label htmlFor="transcripts" className="text-sm font-medium">
            Video Transcripts
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="summaries"
            checked={options.summaries}
            onCheckedChange={(checked) => 
              setOptions(prev => ({ ...prev, summaries: checked as boolean }))}
          />
          <label htmlFor="summaries" className="text-sm font-medium">
            Video Summaries
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="articles"
            checked={options.articles}
            onCheckedChange={(checked) => 
              setOptions(prev => ({ ...prev, articles: checked as boolean }))}
          />
          <label htmlFor="articles" className="text-sm font-medium">
            Generated Articles
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="socialPosts"
            checked={options.socialPosts}
            onCheckedChange={(checked) => 
              setOptions(prev => ({ ...prev, socialPosts: checked as boolean }))}
          />
          <label htmlFor="socialPosts" className="text-sm font-medium">
            Social Media Posts
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="analytics"
            checked={options.analytics}
            onCheckedChange={(checked) => 
              setOptions(prev => ({ ...prev, analytics: checked as boolean }))}
          />
          <label htmlFor="analytics" className="text-sm font-medium">
            Usage Analytics
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <div className="flex items-center text-sm text-gray-500">
          <FileJson className="w-4 h-4 mr-1" />
          Exports as JSON
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FileText className="w-4 h-4 mr-1" />
          Transcripts as CSV
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Share2 className="w-4 h-4 mr-1" />
          Shareable Links
        </div>
      </div>
    </Card>
  );
}
