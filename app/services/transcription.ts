import { pipeline } from '@xenova/transformers';

export class TranscriptionService {
  private static instance: TranscriptionService;
  private transcriber: any;
  private articleGenerator: any;

  private constructor() {}

  public static async getInstance(): Promise<TranscriptionService> {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService();
      await TranscriptionService.instance.initialize();
    }
    return TranscriptionService.instance;
  }

  private async initialize() {
    try {
      // Initialize Whisper model for transcription
      this.transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
      // Initialize small text generation model for article formatting
      this.articleGenerator = await pipeline('text-generation', 'Xenova/gpt2-tiny');
    } catch (error) {
      console.error('Error initializing models:', error);
      throw error;
    }
  }

  public async getYouTubeTranscript(videoId: string): Promise<string> {
    try {
      // First try to get YouTube's own captions
      const response = await fetch(`/api/youtube-transcript?videoId=${videoId}`);
      const data = await response.json();
      
      if (data.transcript) {
        return data.transcript;
      }
      
      throw new Error('No YouTube transcript available');
    } catch (error) {
      console.warn('Falling back to browser transcription');
      // Fallback to browser transcription
      return this.transcribeAudio(videoId);
    }
  }

  private async transcribeAudio(videoId: string): Promise<string> {
    try {
      const audioUrl = await this.getAudioUrl(videoId);
      const result = await this.transcriber(audioUrl, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: 'english',
        task: 'transcribe',
      });

      return result.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  private async getAudioUrl(videoId: string): Promise<string> {
    // Get audio URL using ytdl-core on client side
    const response = await fetch(`/api/youtube-audio?videoId=${videoId}`);
    const data = await response.json();
    return data.audioUrl;
  }

  public async generateArticle(transcript: string): Promise<string> {
    try {
      // Basic article formatting using the tiny model
      const result = await this.articleGenerator(transcript, {
        max_length: 1000,
        temperature: 0.7,
      });

      return this.formatArticle(result[0].generated_text);
    } catch (error) {
      console.error('Error generating article:', error);
      // Fallback to basic formatting
      return this.formatArticle(transcript);
    }
  }

  private formatArticle(text: string): string {
    // Basic formatting rules
    const sentences = text.split(/[.!?]+/);
    const paragraphs = [];
    let currentParagraph = [];

    for (const sentence of sentences) {
      if (sentence.trim().length === 0) continue;
      currentParagraph.push(sentence.trim());
      
      if (currentParagraph.length >= 3) {
        paragraphs.push(currentParagraph.join('. ') + '.');
        currentParagraph = [];
      }
    }

    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join('. ') + '.');
    }

    return paragraphs.join('\n\n');
  }
}
