import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId, url } = await request.json();
    if (!videoId || !url) {
      return NextResponse.json(
        { error: 'Video ID and URL are required' },
        { status: 400 }
      );
    }

    // Check user credits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (userError || !user?.credits) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 403 }
      );
    }

    // Update video status
    await supabase
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId);

    // Extract video information using ytdl-core
    const videoInfo = await fetch(`https://youtube.com/watch?v=${videoId}`).then(
      (res) => res.json()
    );

    // Transcribe video using Hugging Face
    const transcription = await hf.automaticSpeechRecognition({
      model: 'openai/whisper-large-v2',
      data: url,
    });

    // Generate summary using Hugging Face
    const summary = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: transcription.text,
      parameters: {
        max_length: 130,
        min_length: 30,
      },
    });

    // Extract keywords using Hugging Face
    const keywords = await hf.tokenClassification({
      model: 'yanekyuk/bert-uncased-keyword-extractor',
      inputs: transcription.text,
    });

    // Update video record with processed data
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'completed',
        title: videoInfo.title,
        duration: videoInfo.lengthSeconds,
        thumbnail_url: videoInfo.thumbnails[0].url,
        transcript: transcription.text,
        summary: summary.summary_text,
        keywords: keywords.map((k: any) => k.word).join(', '),
        processed_at: new Date().toISOString(),
      })
      .eq('id', videoId);

    if (updateError) {
      throw updateError;
    }

    // Deduct credit from user
    await supabase
      .from('users')
      .update({ credits: user.credits - 1 })
      .eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing video:', error);

    // Update video status to failed
    if (error.videoId) {
      await supabase
        .from('videos')
        .update({ status: 'failed', error: error.message })
        .eq('id', error.videoId);
    }

    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}
