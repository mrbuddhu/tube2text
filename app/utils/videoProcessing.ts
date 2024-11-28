import ytdl from 'ytdl-core';
import { processTranscript } from './textProcessing';

export interface VideoInfo {
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
}

export interface ProcessedVideo {
  info: VideoInfo;
  transcript: {
    text: string;
    chapters: Array<{ title: string; start: number; end: number; content: string }>;
    summary: string;
    keywords: string[];
  };
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  try {
    const info = await ytdl.getInfo(url);
    return {
      title: info.videoDetails.title,
      description: info.videoDetails.description || '',
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnailUrl: info.videoDetails.thumbnails[0].url,
    };
  } catch (error) {
    throw new Error('Failed to fetch video information');
  }
}

export async function getVideoTranscript(url: string): Promise<string> {
  try {
    const info = await ytdl.getInfo(url);
    const captions = info.player_response.captions;
    
    if (!captions || !captions.playerCaptionsTracklistRenderer) {
      throw new Error('No captions available for this video');
    }

    // Get the first available caption track (usually English)
    const captionTrack = captions.playerCaptionsTracklistRenderer.captionTracks[0];
    if (!captionTrack) {
      throw new Error('No caption track found');
    }

    // Fetch the captions
    const response = await fetch(captionTrack.baseUrl);
    const xml = await response.text();
    
    // Parse XML and extract text
    const transcript = xml
      .replace(/<[^>]*>/g, '')
      .replace(/\\n/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    return transcript;
  } catch (error) {
    throw new Error('Failed to fetch video transcript');
  }
}

export async function processVideo(url: string): Promise<ProcessedVideo> {
  try {
    const [info, transcriptText] = await Promise.all([
      getVideoInfo(url),
      getVideoTranscript(url),
    ]);

    const processed = processTranscript(transcriptText);

    return {
      info,
      transcript: {
        text: transcriptText,
        chapters: processed.chapters,
        summary: processed.summary,
        keywords: processed.keywords,
      },
    };
  } catch (error) {
    throw new Error('Failed to process video');
  }
}
