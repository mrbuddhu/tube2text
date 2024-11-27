import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';

const FREE_USAGE_KEY = 'tube2text_free_usage';
const MAX_FREE_USES = 2;

const getFreeUsageCount = (): number => {
  try {
    const usageData = localStorage.getItem(FREE_USAGE_KEY);
    return usageData ? parseInt(usageData, 10) : 0;
  } catch {
    return 0;
  }
};

const incrementFreeUsage = (): void => {
  try {
    const currentUsage = getFreeUsageCount();
    localStorage.setItem(FREE_USAGE_KEY, (currentUsage + 1).toString());
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
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const formatTranscript = (transcriptItems: any[]): string => {
  let text = '';
  let currentParagraph = '';
  let wordCount = 0;

  transcriptItems.forEach((item) => {
    currentParagraph += item.text + ' ';
    wordCount += item.text.split(/\s+/).length;

    if (wordCount >= 50 || item.duration > 2.5) {
      text += currentParagraph.trim() + '\n\n';
      currentParagraph = '';
      wordCount = 0;
    }
  });

  if (currentParagraph) {
    text += currentParagraph.trim();
  }

  return text;
};

export async function POST(request: NextRequest) {
  try {
    const { url, isPaidUser } = await request.json();
    
    // Check free usage limit
    if (!isPaidUser) {
      const usageCount = getFreeUsageCount();
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

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }

    // Increment usage count for free users
    if (!isPaidUser) {
      incrementFreeUsage();
    }

    const totalWords = transcript.reduce((count, item) => 
      count + item.text.split(/\s+/).length, 0
    );

    const formattedText = formatTranscript(transcript);

    return NextResponse.json({
      success: true,
      content: formattedText,
      metadata: {
        duration: duration,
        wordCount: totalWords,
        transcriptSegments: transcript.length,
        remainingFreeUses: isPaidUser ? null : MAX_FREE_USES - (getFreeUsageCount() + 1)
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process video' },
      { status: 500 }
    );
  }
}
