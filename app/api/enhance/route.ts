import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
      // Get summary
      const summaryResponse = await fetch(AI_ENDPOINTS.summarize, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: chunk, parameters: { max_length: 500, min_length: 100 } }),
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        summary += summaryData[0]?.summary_text + ' ';
      }

      // Get sentiment
      const sentimentResponse = await fetch(AI_ENDPOINTS.sentiment, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: chunk }),
      });

      if (sentimentResponse.ok) {
        const sentimentData = await sentimentResponse.json();
        sentiment = sentimentData[0]?.[0]?.label || sentiment;
      }

      // Extract keywords
      const keywordsResponse = await fetch(AI_ENDPOINTS.keywords, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: chunk }),
      });

      if (keywordsResponse.ok) {
        const keywordsData = await keywordsResponse.json();
        keywords = [...new Set([...keywords, ...(keywordsData[0] || [])])];
      }
    }

    // Format the enhanced content
    enhancedText = formatEnhancedContent(text, summary.trim(), sentiment, keywords);
    return enhancedText;
  } catch (error) {
    console.error('Text enhancement error:', error);
    return text;
  }
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function formatEnhancedContent(
  originalText: string,
  summary: string,
  sentiment: string,
  keywords: string[]
): string {
  return `# Article Summary
${summary}

## Key Points
${keywords.slice(0, 5).map(kw => `- ${kw}`).join('\n')}

## Overall Tone
${sentiment}

## Full Content
${originalText}`;
}

function formatToHTML(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<h[12]>|<li>)(.+)$/gm, '$1');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcript, format = 'md' } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Enhance the text with AI
    const enhancedContent = await enhanceText(transcript);

    // Format based on requested format
    let formattedContent = enhancedContent;
    let contentType = 'text/markdown';

    if (format === 'html') {
      formattedContent = formatToHTML(enhancedContent);
      contentType = 'text/html';
    } else if (format === 'txt') {
      formattedContent = enhancedContent.replace(/[#*]/g, '').replace(/\n\n/g, '\n');
      contentType = 'text/plain';
    }

    return NextResponse.json({
      content: formattedContent,
      format,
      contentType,
      metadata: {
        wordCount: formattedContent.split(/\s+/).length,
        readingTime: Math.ceil(formattedContent.split(/\s+/).length / 200), // Assuming 200 words per minute
      }
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance transcript' },
      { status: 500 }
    );
  }
}
