import { supabaseClient } from './supabase';

export interface VideoJob {
  id: string;
  user_id: string;
  video_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  progress?: number;
}

class VideoQueue {
  private processing: boolean = false;
  private maxConcurrent: number = 2;
  private currentJobs: number = 0;

  async addToQueue(userId: string, videoUrl: string): Promise<string> {
    try {
      const { data, error } = await supabaseClient
        .from('video_queue')
        .insert({
          user_id: userId,
          video_url: videoUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Start processing if not already running
      if (!this.processing) {
        this.processQueue();
      }

      return data.id;
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  }

  async processQueue() {
    if (this.processing || this.currentJobs >= this.maxConcurrent) return;
    
    this.processing = true;

    try {
      // Get next pending job
      const { data: jobs, error } = await supabaseClient
        .from('video_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) throw error;
      if (!jobs || jobs.length === 0) {
        this.processing = false;
        return;
      }

      const job = jobs[0];

      // Update job status to processing
      await supabaseClient
        .from('video_queue')
        .update({
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', job.id);

      this.currentJobs++;

      try {
        // Process the video
        await this.processVideo(job);

        // Mark job as completed
        await supabaseClient
          .from('video_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);
      } catch (error) {
        // Mark job as failed
        await supabaseClient
          .from('video_queue')
          .update({
            status: 'failed',
            error: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);
      }

      this.currentJobs--;
      
      // Process next job
      this.processQueue();
    } catch (error) {
      console.error('Error processing queue:', error);
      this.processing = false;
      this.currentJobs = Math.max(0, this.currentJobs - 1);
    }
  }

  private async processVideo(job: VideoJob) {
    // Update progress at different stages
    const updateProgress = async (progress: number) => {
      await supabaseClient
        .from('video_queue')
        .update({ progress })
        .eq('id', job.id);
    };

    try {
      // Download video
      await updateProgress(10);
      // TODO: Implement video download

      // Extract audio
      await updateProgress(30);
      // TODO: Implement audio extraction

      // Transcribe audio
      await updateProgress(60);
      // TODO: Implement transcription

      // Generate content
      await updateProgress(90);
      // TODO: Implement content generation

      await updateProgress(100);
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<VideoJob | null> {
    try {
      const { data, error } = await supabaseClient
        .from('video_queue')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  async getUserJobs(userId: string): Promise<VideoJob[]> {
    try {
      const { data, error } = await supabaseClient
        .from('video_queue')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user jobs:', error);
      return [];
    }
  }
}

export const videoQueue = new VideoQueue();
