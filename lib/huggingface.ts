import { HfInference } from '@huggingface/inference';

if (!process.env.HUGGINGFACE_API_KEY) {
  console.warn('Warning: HUGGINGFACE_API_KEY is not set. Some AI features may be limited.');
}

// Initialize Hugging Face client with API token
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function generateArticle(transcript: string) {
  try {
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    // Using Facebook's BART model for article generation
    const response = await hf.textGeneration({
      model: 'facebook/bart-large-cnn',
      inputs: `Generate a well-structured article from this transcript: ${transcript.slice(0, 2000)}`,
      parameters: {
        max_length: 1000,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.2,
      },
    });

    if (!response.generated_text) {
      throw new Error('Failed to generate article');
    }

    return response.generated_text;
  } catch (error) {
    console.error('Error generating article:', error);
    // Return a formatted version of the transcript as fallback
    return formatTranscriptAsArticle(transcript);
  }
}

function formatTranscriptAsArticle(transcript: string): string {
  const paragraphs = transcript
    .split(/[.!?]+\s+/)
    .reduce((acc: string[], sentence, i) => {
      const paragraphIndex = Math.floor(i / 4);
      acc[paragraphIndex] = acc[paragraphIndex] 
        ? acc[paragraphIndex] + '. ' + sentence 
        : sentence;
      return acc;
    }, []);

  return paragraphs.join('\n\n');
}

export async function generateSummary(transcript: string) {
  try {
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    // Truncate transcript if too long (API limit is usually around 1000 tokens)
    const truncatedTranscript = transcript.slice(0, 2000);

    // Using BART model fine-tuned for summarization
    const response = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: truncatedTranscript,
      parameters: {
        max_length: 150,
        min_length: 50,
        do_sample: false,
      },
    });

    if (!response.summary_text) {
      throw new Error('Failed to generate summary');
    }

    return response.summary_text;
  } catch (error) {
    console.error('Error generating summary:', error);
    // Return first few sentences as fallback
    return transcript.split(/[.!?]+\s+/).slice(0, 3).join('. ') + '.';
  }
}

export async function extractKeywords(transcript: string) {
  try {
    if (!transcript) return [];

    const response = await hf.textClassification({
      model: 'yanekyuk/bert-uncased-keyword-extractor',
      inputs: transcript.slice(0, 2000),
    });

    return response
      .filter(r => r.score > 0.5)
      .map(r => r.label)
      .slice(0, 10);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    // Extract basic keywords as fallback
    return transcript
      .split(/\s+/)
      .filter(word => word.length > 5)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 10);
  }
}

export async function generateSocialMediaPost(title: string, summary: string) {
  try {
    const prompt = `Create an engaging social media post about this video: "${title}". Summary: ${summary}`;
    const response = await hf.textGeneration({
      model: 'facebook/bart-large-cnn',
      inputs: prompt,
      parameters: {
        max_length: 280,
        temperature: 0.8,
        top_p: 0.9,
        repetition_penalty: 1.2,
      },
    });

    if (!response.generated_text) {
      throw new Error('Failed to generate social media post');
    }

    return response.generated_text;
  } catch (error) {
    console.error('Error generating social media post:', error);
    // Create a basic social post as fallback
    return `Check out this video: ${title}\n\nKey points:\n${summary}`;
  }
}

export async function generateHashtags(keywords: string[]) {
  return keywords
    .map(k => k.toLowerCase().replace(/\s+/g, ''))
    .map(k => `#${k}`)
    .slice(0, 5)
    .join(' ');
}

export async function generateSocialPosts(title: string, summary: string, keywords: string[] = []) {
  try {
    const [post, hashtags] = await Promise.all([
      generateSocialMediaPost(title, summary),
      generateHashtags(keywords),
    ]);

    return [
      // Twitter/X post
      post.slice(0, 240) + '\n\n' + hashtags,
      
      // LinkedIn post (more professional tone)
      `🎥 New Video Analysis: ${title}\n\n${summary}\n\nRead the full article for more insights.`,
      
      // Facebook post (more casual tone)
      `📺 Just watched an interesting video about ${title}!\n\n${post}\n\n${hashtags}`,
    ];
  } catch (error) {
    console.error('Error generating social posts:', error);
    // Return basic social posts as fallback
    return [
      `Check out this video: ${title}\n\nKey points:\n${summary}`,
      `New Video Analysis: ${title}\n\n${summary}`,
      `Interesting video about ${title}!\n\n${summary}`,
    ];
  }
}

export async function analyzeSentiment(text: string) {
  try {
    const response = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: text,
    });

    return {
      sentiment: response[0].label,
      confidence: response[0].score,
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error('Failed to analyze sentiment');
  }
}

export async function detectTopics(text: string) {
  try {
    const response = await hf.textClassification({
      model: 'facebook/bart-large-mnli',
      inputs: text,
      parameters: {
        candidate_labels: [
          'technology', 'science', 'politics', 'business', 
          'entertainment', 'sports', 'health', 'education',
          'arts', 'travel', 'food', 'lifestyle'
        ],
      },
    });

    return response.labels.map((label, index) => ({
      topic: label,
      confidence: response.scores[index],
    })).sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error('Error detecting topics:', error);
    throw new Error('Failed to detect topics');
  }
}
