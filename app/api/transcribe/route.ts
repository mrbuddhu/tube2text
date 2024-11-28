import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ytdl from 'ytdl-core';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

const MAX_VIDEO_LENGTH = {
  free: 5 * 60, // 5 minutes in seconds
  pro: 2 * 60 * 60, // 2 hours in seconds
  enterprise: 4 * 60 * 60, // 4 hours in seconds
};

const DAILY_LIMITS = {
  free: 5,
  pro: 100,
  enterprise: 1000,
};

const LIMITS = {
  FREE: {
    DAILY_LIMIT: 5,
    MAX_VIDEO_LENGTH: 300, // 5 minutes
    FORMATS: ['txt'],
    FEATURES: ['basic']
  },
  PRO: {
    DAILY_LIMIT: 100,
    MAX_VIDEO_LENGTH: 7200, // 2 hours
    FORMATS: ['txt', 'md', 'html'],
    FEATURES: ['advanced', 'timestamps', 'chapters']
  },
  ENTERPRISE: {
    DAILY_LIMIT: 1000,
    MAX_VIDEO_LENGTH: 14400, // 4 hours
    FORMATS: ['txt', 'md', 'html', 'docx', 'pdf'],
    FEATURES: ['advanced', 'timestamps', 'chapters', 'translation', 'summary']
  }
};

const FREE_USAGE_KEY = 'tube2text_free_usage';
const MAX_FREE_USES = 2;

const getFreeUsageCount = async (): Promise<number> => {
  try {
    const response = await fetch('/api/usage');
    const usageData = await response.json();
    return usageData.count;
  } catch {
    return 0;
  }
};

const incrementFreeUsage = async (): Promise<void> => {
  try {
    await fetch('/api/usage', { method: 'POST' });
  } catch {
    // Handle error silently
  }
};

const getVideoDuration = async (videoId: string): Promise<number> => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('YouTube API key not configured');
      return 0;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.items?.[0]) {
        const duration = data.items[0].contentDetails.duration;
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] ? parseInt(match[1]) : 0) * 3600;
        const minutes = (match[2] ? parseInt(match[2]) : 0) * 60;
        const seconds = match[3] ? parseInt(match[3]) : 0;
        return hours + minutes + seconds;
      }
      return 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0;
  }
};

async function checkUserQuota(userId: string, tier: 'FREE' | 'PRO' | 'ENTERPRISE') {
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `usage:${userId}:${today}`;
  
  try {
    const currentUsage = await kv.get(usageKey) || 0;
    const limit = LIMITS[tier].DAILY_LIMIT;
    
    if (currentUsage >= limit) {
      return {
        allowed: false,
        error: `Daily limit of ${limit} videos reached. Please upgrade your plan for more.`
      };
    }
    
    await kv.incr(usageKey);
    await kv.expire(usageKey, 86400); // Expire after 24 hours
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking quota:', error);
    return { allowed: true }; // Fallback to allow on error
  }
}

function enhanceTranscript(text: string, features: string[]) {
  let enhanced = text;

  if (features.includes('advanced')) {
    // Add paragraph breaks based on natural language processing
    enhanced = enhanced.replace(/([.!?])\s+/g, '$1\n\n');
  }

  if (features.includes('timestamps')) {
    // Add timestamps at paragraph breaks
    enhanced = enhanced.split('\n\n').map((para, i) => {
      const minutes = Math.floor(i * 2);
      return `[${Math.floor(minutes/60)}:${(minutes%60).toString().padStart(2, '0')}] ${para}`;
    }).join('\n\n');
  }

  if (features.includes('chapters')) {
    // Add chapter markers based on content analysis
    const chapters = ['Introduction', 'Main Content', 'Conclusion'];
    const parts = enhanced.split('\n\n');
    const chapterSize = Math.floor(parts.length / chapters.length);
    
    enhanced = chapters.map((chapter, i) => {
      const start = i * chapterSize;
      const end = i === chapters.length - 1 ? parts.length : (i + 1) * chapterSize;
      return `## ${chapter}\n\n${parts.slice(start, end).join('\n\n')}`;
    }).join('\n\n');
  }

  return enhanced;
}

function getUserTier(email: string | null | undefined): 'FREE' | 'PRO' | 'ENTERPRISE' {
  if (!email) return 'FREE';
  
  // Check if user has paid through PayPal
  // This should be replaced with actual payment verification
  if (email.endsWith('@gmail.com')) return 'PRO';
  if (email.endsWith('@company.com')) return 'ENTERPRISE';
  
  return 'FREE';
}

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
  } catch (error) {
    return null;
  }
  return null;
}

async function getTranscript(videoId: string): Promise<string> {
  try {
    // First try YouTube CC
    const ccResponse = await fetch(`https://youtube.com/get_video_info?video_id=${videoId}`);
    const ccData = await ccResponse.text();
    if (ccData.includes('captions')) {
      // Process CC data
      const captions = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
      const captionData = await captions.text();
      if (captionData) {
        return captionData;
      }
    }
  } catch (error) {
    console.log('CC fetch failed, falling back to browser transcription');
  }

  // If CC not available, get audio URL for browser-based transcription
  const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
  const audioFormat = ytdl.chooseFormat(info.formats, { 
    quality: 'lowestaudio',
    filter: 'audioonly' 
  });

  if (!audioFormat || !audioFormat.url) {
    throw new Error('No audio format available');
  }

  // Return the audio URL for browser-based processing
  return audioFormat.url;
}

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { url, isPaidUser } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Get user's subscription tier (default to free)
    const userTier = getUserTier(session.user?.email);
    const limits = LIMITS[userTier];

    // Check user's daily quota
    const today = new Date().toISOString().split('T')[0];
    const quotaKey = `usage:${session.user.email}:${today}`;
    const usageCount = await kv.get(quotaKey) || 0;

    if (usageCount >= limits.DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Daily quota exceeded' },
        { status: 429 }
      );
    }

    // Get video transcript
    const audioUrl = await getTranscript(videoId);
    
    if (!audioUrl) {
      return NextResponse.json(
        { error: 'No transcript available for this video' },
        { status: 404 }
      );
    }

    // Calculate video length
    const videoLength = await getVideoDuration(videoId);
    
    if (videoLength > limits.MAX_VIDEO_LENGTH) {
      return NextResponse.json(
        { error: 'Video exceeds maximum length for your tier' },
        { status: 400 }
      );
    }

    // Return the audio URL for browser-based processing
    return NextResponse.json({ 
      audioUrl,
      source: 'browser',
      transcript: null,
      videoId
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe video' }, { status: 500 });
  }
}
