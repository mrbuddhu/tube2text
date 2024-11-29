import ytdl from 'ytdl-core';
import { processTranscript } from './textProcessing';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

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

async function downloadAudio(url: string, outputPath: string): Promise<void> {
  try {
    const audioStream = ytdl(url, { quality: 'highestaudio' });
    const writeStream = fs.createWriteStream(outputPath);
    await pipeline(audioStream, writeStream);
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw new Error('Failed to download audio from video');
  }
}

async function convertToWav(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

async function transcribeWithWhisper(audioPath: string): Promise<string> {
  try {
    const audioFile = await fs.readFile(audioPath);
    const response = await hf.automaticSpeechRecognition({
      model: 'openai/whisper-large-v3',
      data: audioFile,
    });
    return response.text;
  } catch (error) {
    console.error('Error transcribing with Whisper:', error);
    throw new Error('Failed to transcribe audio with Whisper');
  }
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
    console.error('Error fetching video info:', error);
    throw new Error('Failed to fetch video information. Please check the URL and try again.');
  }
}

export async function getVideoTranscript(url: string): Promise<string> {
  try {
    // First try to get YouTube captions
    const info = await ytdl.getInfo(url);
    const captions = info.player_response.captions;
    
    if (captions?.playerCaptionsTracklistRenderer?.captionTracks?.length > 0) {
      // Get the first available caption track (usually English)
      const captionTrack = captions.playerCaptionsTracklistRenderer.captionTracks[0];
      
      // Fetch the captions
      const response = await fetch(captionTrack.baseUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch captions');
      }

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

      if (transcript) {
        return transcript;
      }
    }

    // If no captions available, fallback to Whisper
    console.log('No captions available, falling back to Whisper transcription...');
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Generate unique filenames
    const timestamp = Date.now();
    const audioPath = path.join(tempDir, `${timestamp}.mp3`);
    const wavPath = path.join(tempDir, `${timestamp}.wav`);

    try {
      // Download and convert audio
      await downloadAudio(url, audioPath);
      await convertToWav(audioPath, wavPath);

      // Transcribe with Whisper
      const transcript = await transcribeWithWhisper(wavPath);

      // Clean up temp files
      await Promise.all([
        fs.unlink(audioPath).catch(() => {}),
        fs.unlink(wavPath).catch(() => {})
      ]);

      return transcript;
    } catch (error) {
      // Clean up temp files on error
      await Promise.all([
        fs.unlink(audioPath).catch(() => {}),
        fs.unlink(wavPath).catch(() => {})
      ]);
      throw error;
    }
  } catch (error: any) {
    console.error('Error getting transcript:', error);
    throw new Error(error.message || 'Failed to get video transcript. Please try another video.');
  }
}

export async function processVideo(url: string): Promise<ProcessedVideo> {
  try {
    // Get video info first to validate the URL
    const info = await getVideoInfo(url);
    
    // Then get the transcript
    const transcriptText = await getVideoTranscript(url);

    // Process the transcript
    const processed = processTranscript(transcriptText);

    return {
      info,
      transcript: {
        text: transcriptText,
        chapters: processed.chapters,
        summary: processed.summary,
        keywords: processed.keywords
      }
    };
  } catch (error: any) {
    console.error('Error processing video:', error);
    throw new Error(error.message || 'Failed to process video. Please try again.');
  }
}
