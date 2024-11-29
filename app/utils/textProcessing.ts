import keywordExtractor from 'keyword-extractor';
import natural from 'natural';
const { SentenceTokenizer, WordTokenizer } = natural;

const sentenceTokenizer = new SentenceTokenizer();
const wordTokenizer = new WordTokenizer();

export interface Chapter {
  title: string;
  start: number;
  end: number;
  content: string;
}

export interface ProcessedTranscript {
  chapters: Chapter[];
  keywords: string[];
  summary: string;
}

function findTopicBreaks(text: string, minSegmentLength: number = 500): number[] {
  try {
    if (!text) return [];
    
    const sentences = sentenceTokenizer.tokenize(text);
    if (sentences.length === 0) return [];

    const breaks: number[] = [];
    let currentLength = 0;
    let currentStart = 0;

    sentences.forEach((sentence, index) => {
      currentLength += sentence.length;
      if (currentLength >= minSegmentLength) {
        breaks.push(index);
        currentLength = 0;
      }
    });

    return breaks;
  } catch (error) {
    console.error('Error finding topic breaks:', error);
    return [];
  }
}

function generateChapterTitle(text: string): string {
  try {
    if (!text) return 'Chapter';
    
    const words = wordTokenizer.tokenize(text.slice(0, 200));
    if (!words || words.length === 0) return 'Chapter';

    // Get the most significant words
    const keywords = keywordExtractor.extract(text.slice(0, 200), {
      language: 'english',
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });

    // Use first 3-5 keywords to create a title
    const titleWords = keywords.slice(0, Math.min(5, keywords.length));
    if (titleWords.length === 0) return 'Chapter';

    return titleWords.join(' ').slice(0, 50);
  } catch (error) {
    console.error('Error generating chapter title:', error);
    return 'Chapter';
  }
}

function generateChapters(text: string, segments?: Array<{ start: number; end: number; text: string; }>): Chapter[] {
  try {
    if (!text) return [];

    if (segments) {
      return segments.map((segment, index) => ({
        title: generateChapterTitle(segment.text),
        start: segment.start,
        end: segment.end,
        content: segment.text
      }));
    }

    const breaks = findTopicBreaks(text);
    if (breaks.length === 0) {
      return [{
        title: generateChapterTitle(text),
        start: 0,
        end: text.length,
        content: text
      }];
    }

    const sentences = sentenceTokenizer.tokenize(text);
    const chapters: Chapter[] = [];
    let start = 0;

    breaks.forEach((breakPoint, index) => {
      const content = sentences.slice(start, breakPoint).join(' ');
      chapters.push({
        title: generateChapterTitle(content),
        start,
        end: breakPoint,
        content
      });
      start = breakPoint;
    });

    // Add the last chapter
    if (start < sentences.length) {
      const content = sentences.slice(start).join(' ');
      chapters.push({
        title: generateChapterTitle(content),
        start,
        end: sentences.length,
        content
      });
    }

    return chapters;
  } catch (error) {
    console.error('Error generating chapters:', error);
    return [{
      title: 'Chapter 1',
      start: 0,
      end: text.length,
      content: text
    }];
  }
}

function extractKeywords(text: string, maxKeywords: number = 20): string[] {
  try {
    if (!text) return [];

    return keywordExtractor.extract(text, {
      language: 'english',
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    }).slice(0, maxKeywords);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
}

function generateSummary(text: string, maxLength: number = 1000): string {
  try {
    if (!text) return '';
    
    const sentences = sentenceTokenizer.tokenize(text);
    if (sentences.length === 0) return '';

    // Score sentences based on keyword frequency
    const wordFreq = new Map<string, number>();
    sentences.forEach(sentence => {
      const words = wordTokenizer.tokenize(sentence.toLowerCase());
      words?.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });
    });

    const sentenceScores = sentences.map(sentence => {
      const words = wordTokenizer.tokenize(sentence.toLowerCase());
      if (!words) return 0;
      
      return words.reduce((score, word) => score + (wordFreq.get(word) || 0), 0) / words.length;
    });

    // Get top scoring sentences
    const topSentences = sentenceScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .sort((a, b) => a.index - b.index)
      .map(item => sentences[item.index]);

    const summary = topSentences.join(' ');
    return summary.length > maxLength ? summary.slice(0, maxLength) + '...' : summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return text.slice(0, maxLength);
  }
}

export function processTranscript(text: string, segments?: Array<{ start: number; end: number; text: string; }>): ProcessedTranscript {
  try {
    if (!text) {
      throw new Error('No text provided for processing');
    }

    const chapters = generateChapters(text, segments);
    const keywords = extractKeywords(text);
    const summary = generateSummary(text);

    return { chapters, keywords, summary };
  } catch (error: any) {
    console.error('Error processing transcript:', error);
    // Return a basic structure if processing fails
    return {
      chapters: [{
        title: 'Content',
        start: 0,
        end: text.length,
        content: text
      }],
      keywords: [],
      summary: text.slice(0, 1000)
    };
  }
}
