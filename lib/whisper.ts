import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';
import ytdl from 'ytdl-core';

export async function downloadYouTubeAudio(videoUrl: string, outputPath: string): Promise<void> {
  try {
    const videoStream = ytdl(videoUrl, { quality: 'lowestaudio' });
    const writeStream = createWriteStream(outputPath);
    await pipeline(videoStream, writeStream);
  } catch (error) {
    console.error('Error downloading YouTube audio:', error);
    throw error;
  }
}

export async function transcribeAudio(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const whisperProcess = spawn('whisper', [
      audioPath,
      '--model', 'tiny',
      '--output_format', 'txt',
      '--language', 'en'
    ]);

    let output = '';
    let error = '';

    whisperProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    whisperProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    whisperProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Whisper process failed: ${error}`));
      }
    });
  });
}

export async function generateSummary(transcript: string): Promise<string> {
  // Using simple text summarization algorithm
  const sentences = transcript.split(/[.!?]+/);
  const words = transcript.split(' ').length;
  const summaryLength = Math.max(3, Math.floor(sentences.length * 0.2)); // 20% of original length

  // Score sentences based on word frequency
  const wordFreq: { [key: string]: number } = {};
  transcript.toLowerCase().split(/\W+/).forEach(word => {
    if (word.length > 3) { // Skip short words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const sentenceScores = sentences.map(sentence => {
    const words = sentence.toLowerCase().split(/\W+/);
    const score = words.reduce((acc, word) => acc + (wordFreq[word] || 0), 0);
    return { sentence, score: score / words.length };
  });

  // Get top sentences
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, summaryLength)
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
    .map(item => item.sentence);

  return topSentences.join('. ') + '.';
}

export async function generateArticle(transcript: string, summary: string): Promise<string> {
  const paragraphs = transcript.split('\n\n');
  const introduction = summary;
  const mainContent = paragraphs
    .filter(p => p.length > 100) // Filter out short paragraphs
    .map(p => `\n\n${p}`)
    .join('');
  
  const conclusion = `\n\nIn conclusion, ${summary.toLowerCase()}`;
  
  return `${introduction}${mainContent}${conclusion}`;
}

export async function generateSocialPosts(summary: string): Promise<{
  twitter: string;
  linkedin: string;
  facebook: string;
}> {
  const hashtags = '#ContentCreation #YouTube #AI';

  // Twitter post (280 chars)
  const twitter = `${summary.slice(0, 240)}... ${hashtags}`;

  // LinkedIn post (longer, more professional)
  const linkedin = `I just transformed a YouTube video into valuable content!\n\n${summary}\n\n${hashtags}`;

  // Facebook post (casual, engaging)
  const facebook = `Check out this interesting content from a YouTube video:\n\n${summary}\n\n${hashtags}`;

  return {
    twitter,
    linkedin,
    facebook
  };
}
