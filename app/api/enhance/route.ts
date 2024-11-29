import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';

if (!process.env.HUGGING_FACE_API_KEY) {
  throw new Error('Missing HUGGING_FACE_API_KEY environment variable');
}

// Free AI model endpoints from Hugging Face
const AI_ENDPOINTS = {
  summarize: 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
  sentiment: 'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
  keywords: 'https://api-inference.huggingface.co/models/yanekyuk/bert-uncased-keyword-extractor',
};

async function enhanceText(text: string) {
  try {
    // Split text into chunks to handle API limits
    const chunks = splitIntoChunks(text, 1000);
    let enhancedText = '';
    let summary = '';
    let sentiment = '';
    let keywords: string[] = [];

    // Process each chunk
    for (const chunk of chunks) {
      const [chunkSummary, chunkSentiment, chunkKeywords] = await Promise.all([
        fetch(AI_ENDPOINTS.summarize, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
          },
          body: JSON.stringify({ inputs: chunk }),
        }).then(res => res.json()),
        fetch(AI_ENDPOINTS.sentiment, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
          },
          body: JSON.stringify({ inputs: chunk }),
        }).then(res => res.json()),
        fetch(AI_ENDPOINTS.keywords, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
          },
          body: JSON.stringify({ inputs: chunk }),
        }).then(res => res.json()),
      ]);

      summary += chunkSummary[0].summary_text + ' ';
      sentiment = chunkSentiment[0][0].label;
      keywords = [...keywords, ...chunkKeywords[0].keywords];
    }

    // Format the enhanced content
    enhancedText = formatEnhancedContent(text, summary.trim(), sentiment, keywords);
    return enhancedText;
  } catch (error) {
    console.error('Error enhancing text:', error);
    throw new Error('Failed to enhance text');
  }
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  const sentences = text.split(/[.!?]+/);

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + '. ';
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function formatEnhancedContent(
  originalText: string,
  summary: string,
  sentiment: string,
  keywords: string[]
): string {
  return `
# Enhanced Content

## Summary
${summary}

## Sentiment
${sentiment}

## Keywords
${keywords.join(', ')}

## Original Text
${originalText}
`;
}

function formatToHTML(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/\n/g, '<br>');
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { text } = data;

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    const enhancedText = await enhanceText(text);
    return NextResponse.json({ 
      enhancedText,
      html: formatToHTML(enhancedText)
    });
  } catch (error) {
    console.error('Error processing text:', error);
    return NextResponse.json(
      { error: 'Failed to enhance text' },
      { status: 500 }
    );
  }
}
