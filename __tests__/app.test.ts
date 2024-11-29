import { describe, it, expect, beforeEach } from '@jest/globals';
import { processVideo, generateArticle, generateSocialPosts } from '../lib/processing';
import { getWritingStyles, applyWritingStyle } from '../lib/writingStyles';
import { exportToMarkdown, exportToJSON } from '../lib/export';

describe('Video Processing', () => {
  it('should validate YouTube URLs', async () => {
    const validUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
    ];
    const invalidUrls = [
      'https://example.com',
      'not-a-url',
    ];

    // Test valid URLs
    for (const url of validUrls) {
      const result = await processVideo(url);
      expect(result).toBeTruthy();
      expect(result.videoId).toBeTruthy();
    }

    // Test invalid URLs
    for (const url of invalidUrls) {
      await expect(processVideo(url)).rejects.toThrow('Invalid YouTube URL');
    }
  });

  it('should handle video processing errors gracefully', async () => {
    const invalidVideoId = 'invalid-id';
    await expect(processVideo(`https://youtube.com/watch?v=${invalidVideoId}`))
      .rejects.toThrow();
  });
});

describe('Content Generation', () => {
  let transcript: string;

  beforeEach(() => {
    transcript = 'This is a test transcript for content generation.';
  });

  it('should generate an article from transcript', async () => {
    const article = await generateArticle(transcript);
    expect(article).toBeTruthy();
    expect(typeof article).toBe('string');
  });

  it('should generate social media posts', async () => {
    const posts = await generateSocialPosts(transcript);
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBe(3); // Twitter, LinkedIn, Facebook
  });
});

describe('Writing Styles', () => {
  it('should load default writing styles', () => {
    const styles = getWritingStyles();
    expect(Array.isArray(styles)).toBe(true);
    expect(styles.length).toBeGreaterThan(0);
  });

  it('should apply writing style to content', () => {
    const content = 'Test content';
    const style = {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and professional tone',
      formatting: {
        paragraphLength: 'medium',
        useEmoji: false,
        formalityLevel: 'high'
      }
    };

    const formattedContent = applyWritingStyle(content, style);
    expect(formattedContent).toBeTruthy();
    expect(typeof formattedContent).toBe('string');
  });
});

describe('Export Functionality', () => {
  const testContent = {
    videoId: 'test-id',
    title: 'Test Video',
    article: 'Test article content',
    socialPosts: {
      twitter: 'Test tweet',
      linkedin: 'Test LinkedIn post',
      facebook: 'Test Facebook post'
    },
    metadata: {
      processedAt: new Date().toISOString(),
      duration: '10:00',
      language: 'en'
    }
  };

  it('should export to Markdown', () => {
    const markdown = exportToMarkdown(testContent);
    expect(markdown).toContain('# Test Video');
    expect(markdown).toContain('Test article content');
  });

  it('should export to JSON', () => {
    const json = exportToJSON(testContent);
    const parsed = JSON.parse(json);
    expect(parsed.title).toBe('Test Video');
    expect(parsed.article).toBe('Test article content');
  });
});
