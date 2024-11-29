'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Share2, Twitter, Facebook, Linkedin, Link } from 'lucide-react';

interface PreviewProps {
  videoId: string;
  title: string;
  summary: string;
  article: string;
  socialPost: string;
  hashtags: string[];
}

export function ShareablePreview({ 
  videoId, 
  title, 
  summary, 
  article, 
  socialPost, 
  hashtags 
}: PreviewProps) {
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const shareUrl = `${window.location.origin}/share/${videoId}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard"
    });
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(
      `Check out my AI-generated content for "${title}"\n\n${summary.slice(0, 100)}...`
    );
    const url = encodeURIComponent(shareUrl);
    const hashtag = encodeURIComponent(hashtags[0] || 'Tube2Text');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtag}`, '_blank');
  }

  function shareOnLinkedIn() {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  function shareOnFacebook() {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Share Your Content</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Make Public</span>
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>
      </div>

      {isPublic ? (
        <div className="space-y-6">
          {/* Preview Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Preview Shared Content</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>

          {/* Content Preview */}
          {showPreview && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-gray-600">{summary}</p>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={copyLink}
            >
              <Link className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={shareOnTwitter}
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={shareOnLinkedIn}
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={shareOnFacebook}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
          </div>

          {/* Engagement Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-500">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-500">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-500">Clicks</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Enable public sharing to generate a shareable link and track engagement</p>
        </div>
      )}
    </Card>
  );
}
