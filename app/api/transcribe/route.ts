import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { url, isPaidUser } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    console.log('Fetching transcript for video:', videoId);

    // Get transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript available for this video' },
        { status: 404 }
      );
    }

    // Process transcript
    const content = transcript
      .map(item => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Format into paragraphs (basic formatting)
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const paragraphs = [];
    let currentParagraph = [];

    for (const sentence of sentences) {
      currentParagraph.push(sentence.trim());
      if (currentParagraph.length >= 3) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    }

    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }

    const formattedContent = paragraphs.join('\n\n');

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

    const totalWords = formattedContent.split(/\s+/).length;

    // Increment usage count for free users
    if (!isPaidUser) {
      await incrementFreeUsage();
    }

    // Return formatted transcript
    return NextResponse.json({
      content: formattedContent,
      metadata: {
        videoId,
        duration: duration,
        wordCount: totalWords,
        transcriptSegments: transcript.length,
        remainingFreeUses: isPaidUser ? null : MAX_FREE_USES - (await getFreeUsageCount())
      }
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process video' },
      { status: 500 }
    );
  }
}
