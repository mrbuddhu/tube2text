import { NextRequest, NextResponse } from 'next/server';
import { processVideo } from '@/app/utils/videoProcessing';
import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  generateArticle, 
  generateSummary, 
  extractKeywords,
  analyzeSentiment,
  detectTopics,
  generateSocialMediaPost,
  generateHashtags
} from '@/lib/huggingface';
import { trackEvent, trackError, trackPerformance, AnalyticsEvents } from '@/lib/analytics';

// Rate limiting map (consider using Redis in production)
const userRequests = new Map<string, { count: number; resetTime: number }>();
const FREE_TIER_LIMIT = 5; // 5 requests per day
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = userRequests.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    userRequests.set(userId, {
      count: 1,
      resetTime: now + RESET_INTERVAL,
    });
    return true;
  }

  if (userLimit.count >= FREE_TIER_LIMIT) {
    // Track when users hit the free tier limit
    trackEvent(AnalyticsEvents.FREE_TIER_LIMIT_REACHED, { userId });
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Daily limit exceeded. Please upgrade your plan.' },
        { status: 429 }
      );
    }

    const data = await req.json();
    const { videoUrl } = data;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Track video processing start
    await trackEvent(AnalyticsEvents.VIDEO_PROCESSING_STARTED, {
      userId,
      videoUrl
    });

    // Process the video
    const processedVideo = await processVideo(videoUrl);
    const transcript = processedVideo.transcript.text;

    // Track successful video processing
    await trackEvent(AnalyticsEvents.VIDEO_PROCESSING_COMPLETED, {
      userId,
      videoUrl,
      processingTime: Date.now() - startTime
    });

    // Generate all AI content in parallel
    const [
      article,
      summary,
      keywords,
      sentiment,
      topics,
      socialPost
    ] = await Promise.all([
      generateArticle(transcript),
      generateSummary(transcript),
      extractKeywords(transcript),
      analyzeSentiment(transcript),
      detectTopics(transcript),
      generateSocialMediaPost(transcript)
    ]);

    // Generate hashtags from keywords
    const hashtags = generateHashtags(keywords);

    // Track AI generation success
    await trackEvent(AnalyticsEvents.AI_ARTICLE_GENERATED, { userId });
    await trackEvent(AnalyticsEvents.AI_SUMMARY_GENERATED, { userId });

    // Save to Supabase
    const { data: transcription, error } = await supabaseAdmin
      .from('transcriptions')
      .insert({
        user_id: userId,
        title: processedVideo.info.title,
        url: videoUrl,
        transcript: transcript,
        summary,
        keywords,
        article,
        sentiment: sentiment.sentiment,
        sentiment_score: sentiment.confidence,
        topics: topics,
        social_post: socialPost,
        hashtags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      trackError(new Error('Failed to save transcription'), {
        userId,
        videoUrl,
        error
      });
      throw new Error('Failed to save transcription');
    }

    // Track performance metrics
    await trackPerformance({
      name: 'video_processing_time',
      value: Date.now() - startTime,
      userId
    });

    return NextResponse.json({
      id: transcription.id,
      summary,
      sentiment,
      topics,
      socialPost,
      hashtags
    });
  } catch (error: any) {
    console.error('Error processing video:', error);
    
    // Track error
    trackError(error, {
      userId: auth()?.userId,
      videoUrl: req.json?.videoUrl,
      processingTime: Date.now() - startTime
    });

    // Track failed event
    await trackEvent(AnalyticsEvents.VIDEO_PROCESSING_FAILED, {
      userId: auth()?.userId,
      error: error.message
    });

    return NextResponse.json(
      { error: error.message || 'Failed to process video' },
      { status: 500 }
    );
  }
}
