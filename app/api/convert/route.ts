import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import ytdl from 'ytdl-core';
import { getVideoTranscript } from '@/app/utils/videoProcessing';
import { generateArticle, generateSummary, extractKeywords, generateSocialPosts } from '@/lib/huggingface';

function formatArticle(transcription: string, title: string, summary: string): string {
  try {
    // Split into sentences and clean them
    const sentences = transcription
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Group sentences into paragraphs (4-5 sentences per paragraph)
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];

    sentences.forEach((sentence, index) => {
      currentParagraph.push(sentence);
      
      // Start new paragraph after 4-5 sentences or if it's a natural break
      if (currentParagraph.length >= 4 || 
          (currentParagraph.length >= 3 && sentence.length > 100) ||
          index === sentences.length - 1) {
        paragraphs.push(currentParagraph.join('. ') + '.');
        currentParagraph = [];
      }
    });

    // Add any remaining sentences
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join('. ') + '.');
    }

    // Create introduction from the AI-generated summary
    const introduction = summary || 'Here is an analysis of the video content.';

    // Create conclusion
    const conclusion = `This article explored the key insights from "${title}". The video provides valuable information that helps viewers better understand the topic in depth.`;

    // Format the final article with proper structure
    return `# ${title}

## Introduction
${introduction}

## Main Content
${paragraphs.map(p => `${p}\n`).join('\n')}

## Conclusion
${conclusion}`;
  } catch (error) {
    console.error('Error formatting article:', error);
    // Return a basic formatted version if processing fails
    return `# ${title}\n\n${transcription}`;
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    try {
      // Get video info
      const videoInfo = await ytdl.getInfo(url);
      const videoTitle = videoInfo.videoDetails.title;

      // Get transcription
      const transcription = await getVideoTranscript(url);
      if (!transcription) {
        return NextResponse.json({ 
          error: 'No captions available for this video. Please try a different video.' 
        }, { status: 400 });
      }

      // Process content in parallel
      const [summary, keywords] = await Promise.all([
        generateSummary(transcription),
        extractKeywords(transcription),
      ]);

      // Generate article and social posts
      const [article, socialPosts] = await Promise.all([
        generateArticle(transcription).then(articleText => 
          formatArticle(articleText, videoTitle, summary)
        ),
        generateSocialPosts(videoTitle, summary, keywords),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          transcription,
          article,
          socialPosts,
          summary,
          videoInfo: {
            title: videoTitle,
            duration: parseInt(videoInfo.videoDetails.lengthSeconds),
            thumbnail: videoInfo.videoDetails.thumbnails[0].url,
            keywords
          }
        }
      });

    } catch (error: any) {
      console.error('Error processing video:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to process video. Please try again.' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in convert route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
