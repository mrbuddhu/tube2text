'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { supabaseAdmin } from '@/lib/supabase';
import { Share2, Gift, Award, Users, Copy, Twitter } from 'lucide-react';

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  videosEarned: number;
  nextMilestone: number;
}

const MILESTONES = [
  { referrals: 3, reward: 10 },
  { referrals: 10, reward: 25 },
  { referrals: 25, reward: 50 },
  { referrals: 50, reward: 100 },
  { referrals: 100, reward: 'unlimited' }
];

export function ReferralSystem() {
  const { user } = useUser();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats>({
    referralCode: '',
    referralCount: 0,
    videosEarned: 0,
    nextMilestone: 3
  });

  useEffect(() => {
    if (user?.id) {
      fetchReferralStats();
      generateReferralCode();
    }
  }, [user?.id]);

  async function fetchReferralStats() {
    const { data, error } = await supabaseAdmin
      .from('referral_stats')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      const nextMilestone = MILESTONES.find(m => m.referrals > data.referral_count)?.referrals || 100;
      setStats({
        referralCode: data.referral_code,
        referralCount: data.referral_count,
        videosEarned: data.videos_earned,
        nextMilestone
      });
    }
  }

  async function generateReferralCode() {
    const code = `TUBE2TEXT${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await supabaseAdmin
      .from('referral_stats')
      .upsert({
        user_id: user?.id,
        referral_code: code,
        referral_count: 0,
        videos_earned: 0
      });
    setStats(prev => ({ ...prev, referralCode: code }));
  }

  function copyReferralLink() {
    const link = `${window.location.origin}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(
      "🚀 Transform your YouTube videos into articles, summaries, and social posts with AI! Get 10 free videos when you sign up using my link:"
    );
    const url = encodeURIComponent(`${window.location.origin}?ref=${stats.referralCode}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  const progressToNextMilestone = (stats.referralCount / stats.nextMilestone) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Referral Program</h2>
        <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Beta
        </Badge>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            Referrals
          </div>
          <div className="text-2xl font-bold">{stats.referralCount}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Gift className="w-4 h-4" />
            Videos Earned
          </div>
          <div className="text-2xl font-bold">{stats.videosEarned}</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Award className="w-4 h-4" />
            Next Milestone
          </div>
          <div className="text-2xl font-bold">{stats.nextMilestone} referrals</div>
        </div>
      </div>

      {/* Progress to Next Milestone */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress to next reward</span>
          <span>{stats.referralCount} / {stats.nextMilestone}</span>
        </div>
        <Progress value={progressToNextMilestone} className="h-2" />
      </div>

      {/* Referral Link */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Your Referral Link</label>
          <div className="flex gap-2 mt-1">
            <Input
              value={`${window.location.origin}?ref=${stats.referralCode}`}
              readOnly
            />
            <Button variant="outline" onClick={copyReferralLink}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={shareOnTwitter}>
            <Twitter className="w-4 h-4 mr-2" />
            Share on Twitter
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Tube2Text - AI Video Content Generator',
                  text: 'Transform your YouTube videos into articles, summaries, and social posts with AI!',
                  url: `${window.location.origin}?ref=${stats.referralCode}`
                });
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="mt-8">
        <h3 className="font-semibold mb-4">Referral Rewards</h3>
        <div className="space-y-2">
          {MILESTONES.map((milestone, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                stats.referralCount >= milestone.referrals 
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className={`w-4 h-4 ${
                  stats.referralCount >= milestone.referrals 
                    ? 'text-green-500'
                    : 'text-gray-400'
                }`} />
                <span>{milestone.referrals} referrals</span>
              </div>
              <span className="font-medium">
                {milestone.reward === 'unlimited' 
                  ? 'Unlimited videos/month'
                  : `${milestone.reward} extra videos/month`
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
