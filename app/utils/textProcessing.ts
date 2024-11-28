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
  const sentences = sentenceTokenizer.tokenize(text);
  const breaks: number[] = [];
  let currentLength = 0;
  let currentStart = 0;

  sentences.forEach((sentence, index) => {
    currentLength += sentence.length;
    if (currentLength >= minSegmentLength) {
      breaks.push(index);
      currentLength = 0;
      currentStart = index + 1;
    }
  });

  return breaks;
}

function generateChapterTitle(text: string): string {
  // Extract keywords from the first few sentences
  const firstSentences = sentenceTokenizer.tokenize(text).slice(0, 2).join(' ');
  const keywords = keywordExtractor.extract(firstSentences, {
    language: 'english',
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  });

  // Use the first 3-4 significant keywords to create a title
  return keywords.slice(0, 4).join(' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function generateChapters(text: string, segments?: Array<{ start: number; end: number; text: string; }>): Chapter[] {
  const breaks = findTopicBreaks(text);
  const chapters: Chapter[] = [];
  let currentStart = 0;

  breaks.forEach((breakPoint, index) => {
    const sentences = sentenceTokenizer.tokenize(text);
    const chapterText = sentences.slice(currentStart, breakPoint).join(' ');
    
    let startTime = 0;
    let endTime = 0;
    
    if (segments) {
      // Find corresponding segment times
      const startSegment = segments[currentStart];
      const endSegment = segments[breakPoint - 1];
      if (startSegment && endSegment) {
        startTime = startSegment.start;
        endTime = endSegment.end;
      }
    }

    chapters.push({
      title: generateChapterTitle(chapterText),
      start: startTime,
      end: endTime,
      content: chapterText
    });

    currentStart = breakPoint;
  });

  return chapters;
}

export function extractKeywords(text: string, maxKeywords: number = 20): string[] {
  return keywordExtractor.extract(text, {
    language: 'english',
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  }).slice(0, maxKeywords);
}

export function generateSummary(text: string, maxLength: number = 1000): string {
  const sentences = sentenceTokenizer.tokenize(text);
  const words = wordTokenizer.tokenize(text);
  
  // Calculate sentence scores based on word frequency
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    const normalized = word.toLowerCase();
    wordFreq[normalized] = (wordFreq[normalized] || 0) + 1;
  });

  const sentenceScores = sentences.map(sentence => {
    const sentenceWords = wordTokenizer.tokenize(sentence);
    const score = sentenceWords.reduce((acc, word) => {
      return acc + (wordFreq[word.toLowerCase()] || 0);
    }, 0) / sentenceWords.length;
    return { sentence, score };
  });

  // Select top sentences for summary
  const sortedSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .map(item => item.sentence);

  let summary = '';
  let currentLength = 0;
  
  for (const sentence of sortedSentences) {
    if (currentLength + sentence.length > maxLength) break;
    summary += sentence + ' ';
    currentLength += sentence.length;
  }

  return summary.trim();
}

export function processTranscript(text: string, segments?: Array<{ start: number; end: number; text: string; }>): ProcessedTranscript {
  return {
    chapters: generateChapters(text, segments),
    keywords: extractKeywords(text),
    summary: generateSummary(text)
  };
}
