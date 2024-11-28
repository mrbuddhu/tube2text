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
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { exec } from 'child_process';
import nodeWhisper from 'node-whisper';
import { EventEmitter } from 'events';
import { processTranscript } from '@/app/utils/textProcessing';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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

const progressEmitter = new EventEmitter();
const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

interface TranscriptionProgress {
  status: 'downloading' | 'transcribing' | 'complete' | 'error';
  progress: number;
  message?: string;
}

interface TranscriptionResult {
  text: string;
  language?: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  cached?: boolean;
}

interface EnhancedTranscriptionResult extends TranscriptionResult {
  chapters: Array<{
    title: string;
    start: number;
    end: number;
    content: string;
  }>;
  keywords: string[];
  summary: string;
}

async function getCachedTranscript(videoId: string): Promise<TranscriptionResult | null> {
  try {
    const cached = await kv.get(`transcript:${videoId}`);
    if (cached) {
      return {
        ...cached,
        cached: true
      };
    }
    return null;
  } catch (error) {
    console.error('Cache error:', error);
    return null;
  }
}

async function cacheTranscript(videoId: string, result: TranscriptionResult): Promise<void> {
  try {
    await kv.set(`transcript:${videoId}`, result, { ex: CACHE_TTL });
  } catch (error) {
    console.error('Cache error:', error);
  }
}

async function updateProgress(videoId: string, progress: TranscriptionProgress): Promise<void> {
  try {
    await kv.set(`progress:${videoId}`, progress, { ex: 300 }); // 5 minutes TTL
    progressEmitter.emit(`progress:${videoId}`, progress);
  } catch (error) {
    console.error('Progress update error:', error);
  }
}

async function downloadAudio(url: string, outputPath: string, videoId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    ffmpeg(url)
      .toFormat('mp3')
      .on('progress', (info) => {
        progress = Math.min(100, Math.round(info.percent || 0));
        updateProgress(videoId, {
          status: 'downloading',
          progress,
          message: `Downloading audio: ${progress}%`
        });
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

async function transcribeAudioLocally(audioPath: string, videoId: string): Promise<TranscriptionResult> {
  try {
    // Initialize whisper with the base model (good balance of speed and accuracy)
    const whisper = await nodeWhisper.whisper({
      modelName: 'base',
      language: 'en',
      debug: true, // Enable progress logging
      onProgress: (progress) => {
        updateProgress(videoId, {
          status: 'transcribing',
          progress: Math.round(progress * 100),
          message: `Transcribing: ${Math.round(progress * 100)}%`
        });
      }
    });

    // Transcribe with segments for timestamps
    const result = await whisper.transcribe(audioPath, {
      segments: true,
      timestamps: true
    });

    return {
      text: result.text,
      language: result.language,
      segments: result.segments?.map(seg => ({
        start: seg.start,
        end: seg.end,
        text: seg.text
      }))
    };
  } catch (error) {
    console.error('Error in local transcription:', error);
    throw error;
  }
}

async function getTranscript(videoId: string): Promise<EnhancedTranscriptionResult> {
  // Check cache first
  const cached = await getCachedTranscript(videoId);
  if (cached) {
    return cached as EnhancedTranscriptionResult;
  }

  try {
    // First try YouTube CC
    updateProgress(videoId, {
      status: 'downloading',
      progress: 0,
      message: 'Checking YouTube captions...'
    });

    const ccResponse = await fetch(`https://youtube.com/get_video_info?video_id=${videoId}`);
    const ccData = await ccResponse.text();
    if (ccData.includes('captions')) {
      const captions = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
      const captionData = await captions.text();
      if (captionData) {
        updateProgress(videoId, {
          status: 'transcribing',
          progress: 50,
          message: 'Processing transcript...'
        });

        const processed = processTranscript(captionData);
        const result = {
          text: captionData,
          language: 'en',
          source: 'youtube_cc',
          ...processed
        };

        await cacheTranscript(videoId, result);
        return result;
      }
    }
  } catch (error) {
    console.log('CC fetch failed, falling back to local transcription');
  }

  // If CC not available, download audio and transcribe locally
  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'lowestaudio',
      filter: 'audioonly' 
    });

    if (!audioFormat || !audioFormat.url) {
      throw new Error('No audio format available');
    }

    const tempFile = path.join(os.tmpdir(), `${videoId}.mp3`);
    
    // Download and convert audio to mp3
    await downloadAudio(audioFormat.url, tempFile, videoId);

    // Transcribe using local Whisper model
    const transcription = await transcribeAudioLocally(tempFile, videoId);

    updateProgress(videoId, {
      status: 'transcribing',
      progress: 75,
      message: 'Processing transcript...'
    });

    // Process the transcript
    const processed = processTranscript(transcription.text, transcription.segments);
    const result = {
      ...transcription,
      ...processed
    };

    // Clean up temp file
    await unlink(tempFile);

    // Cache the result
    await cacheTranscript(videoId, result);

    // Update final progress
    await updateProgress(videoId, {
      status: 'complete',
      progress: 100,
      message: 'Transcription complete!'
    });

    return result;
  } catch (error) {
    await updateProgress(videoId, {
      status: 'error',
      progress: 0,
      message: error.message || 'Failed to transcribe video'
    });
    console.error('Error in audio transcription:', error);
    throw new Error('Failed to transcribe video');
  }
}

// Add progress endpoint
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const videoId = url.searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  const progress = await kv.get(`progress:${videoId}`);
  return NextResponse.json(progress || { status: 'unknown', progress: 0 });
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
    const transcript = await getTranscript(videoId);
    
    if (!transcript) {
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

    // Return the transcript
    return NextResponse.json({ 
      transcript,
      videoId
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe video' }, { status: 500 });
  }
}
