import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';

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

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
    );
    
    if (response.data.items?.[0]) {
      const duration = response.data.items[0].contentDetails.duration;
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = (match[1] ? parseInt(match[1]) : 0) * 3600;
      const minutes = (match[2] ? parseInt(match[2]) : 0) * 60;
      const seconds = match[3] ? parseInt(match[3]) : 0;
      return hours + minutes + seconds;
    }
    return 0;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0;
  }
};

const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const formatTranscript = (transcriptItems: any[]): string => {
  let formattedText = '';
  let currentParagraph = '';
  
  for (const item of transcriptItems) {
    const sentence = item.text.trim();
    if (!sentence) continue;

    // Start a new paragraph after long pauses or when current paragraph is long
    if (currentParagraph.length > 500 || item.offset > 2000) {
      if (currentParagraph) {
        formattedText += currentParagraph.trim() + '\n\n';
        currentParagraph = '';
      }
    }

    // Add the sentence to current paragraph
    currentParagraph += (currentParagraph ? ' ' : '') + sentence;
  }

  // Add the last paragraph
  if (currentParagraph) {
    formattedText += currentParagraph.trim();
  }

  return formattedText;
};

export async function POST(request: NextRequest) {
  try {
    const { url, isPaidUser } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Check free usage limit
    if (!isPaidUser) {
      const usageCount = await getFreeUsageCount();
      if (usageCount >= MAX_FREE_USES) {
        return NextResponse.json(
          { 
            error: 'Free usage limit reached. Please upgrade to continue using the service.',
            usageCount,
            maxUses: MAX_FREE_USES
          },
          { status: 403 }
        );
      }
    }

    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    console.log('Fetching transcript for video:', videoId);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }

    const duration = await getVideoDuration(videoId);
    const maxDuration = isPaidUser ? 4 * 3600 : 300; // 4 hours for paid, 5 minutes for free

    if (duration > maxDuration) {
      return NextResponse.json(
        { 
          error: `Video is too long. Maximum duration is ${isPaidUser ? '4 hours' : '5 minutes'}.`,
          duration,
          maxDuration
        },
        { status: 400 }
      );
    }

    const totalWords = transcript.reduce((count, item) => 
      count + item.text.split(/\s+/).length, 0
    );

    const formattedText = formatTranscript(transcript);

    // Increment usage count for free users
    if (!isPaidUser) {
      await incrementFreeUsage();
    }

    return NextResponse.json({
      success: true,
      content: formattedText,
      metadata: {
        duration: duration,
        wordCount: totalWords,
        transcriptSegments: transcript.length,
        remainingFreeUses: isPaidUser ? null : MAX_FREE_USES - (await getFreeUsageCount())
      }
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    
    let errorMessage = 'Failed to process video';
    let statusCode = 500;

    if (error.message.includes('No transcript available')) {
      errorMessage = 'No transcript available for this video. Make sure the video has closed captions enabled.';
      statusCode = 400;
    } else if (error.message.includes('Could not find video')) {
      errorMessage = 'Video not found. Please check the URL and try again.';
      statusCode = 404;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
