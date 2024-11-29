export interface WritingStyle {
  id: string;
  name: string;
  description: string;
  articleTemplate: string;
  socialTemplate: string;
  tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'humorous';
  formatting: {
    paragraphLength: 'short' | 'medium' | 'long';
    useEmoji: boolean;
    useHashtags: boolean;
    useBulletPoints: boolean;
  };
}

const DEFAULT_STYLES: WritingStyle[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clear, concise, and business-focused content',
    articleTemplate: `# {title}\n\n## Executive Summary\n{summary}\n\n## Key Points\n{keyPoints}\n\n## Detailed Analysis\n{content}\n\n## Conclusion\n{conclusion}`,
    socialTemplate: `📊 New insights on {topic}:\n\nKey takeaway: {mainPoint}\n\n💡 Learn more: {url}`,
    tone: 'professional',
    formatting: {
      paragraphLength: 'medium',
      useEmoji: false,
      useHashtags: true,
      useBulletPoints: true
    }
  },
  {
    id: 'casual',
    name: 'Casual & Friendly',
    description: 'Conversational and engaging content',
    articleTemplate: `Hey there! 👋\n\nLet's talk about {title}!\n\n{summary}\n\nHere's what you need to know:\n{keyPoints}\n\n{content}\n\nWrapping up:\n{conclusion}`,
    socialTemplate: `Hey friends! 👋\n\nCheck this out: {mainPoint}\n\n🔍 Full video here: {url}\n\n#MustWatch #Insights`,
    tone: 'casual',
    formatting: {
      paragraphLength: 'short',
      useEmoji: true,
      useHashtags: true,
      useBulletPoints: true
    }
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Scholarly and research-focused content',
    articleTemplate: `Title: {title}\n\nAbstract\n{summary}\n\nIntroduction\n{introduction}\n\nMethodology\n{methodology}\n\nFindings\n{content}\n\nConclusion\n{conclusion}\n\nReferences\n{references}`,
    socialTemplate: `Research Update: {title}\n\nKey Finding: {mainPoint}\n\nRead more: {url}\n\n#Research #Academia`,
    tone: 'formal',
    formatting: {
      paragraphLength: 'long',
      useEmoji: false,
      useHashtags: true,
      useBulletPoints: false
    }
  }
];

export function getWritingStyles(): WritingStyle[] {
  try {
    const saved = localStorage.getItem('tube2text_writing_styles');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading writing styles:', error);
  }
  return DEFAULT_STYLES;
}

export function saveWritingStyle(style: WritingStyle) {
  try {
    const styles = getWritingStyles();
    const index = styles.findIndex(s => s.id === style.id);
    if (index >= 0) {
      styles[index] = style;
    } else {
      styles.push(style);
    }
    localStorage.setItem('tube2text_writing_styles', JSON.stringify(styles));
    return true;
  } catch (error) {
    console.error('Error saving writing style:', error);
    return false;
  }
}

export function deleteWritingStyle(id: string) {
  try {
    const styles = getWritingStyles();
    const filtered = styles.filter(s => s.id !== id);
    localStorage.setItem('tube2text_writing_styles', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting writing style:', error);
    return false;
  }
}

export function applyWritingStyle(content: string, style: WritingStyle): string {
  // Apply formatting based on style preferences
  let formattedContent = content;

  // Apply paragraph length
  if (style.formatting.paragraphLength === 'short') {
    formattedContent = formattedContent.replace(/\n{3,}/g, '\n\n');
  } else if (style.formatting.paragraphLength === 'long') {
    formattedContent = formattedContent.replace(/\n\n/g, '\n');
  }

  // Add emoji if enabled
  if (style.formatting.useEmoji) {
    formattedContent = addEmoji(formattedContent);
  }

  // Add hashtags if enabled
  if (style.formatting.useHashtags) {
    formattedContent = addHashtags(formattedContent);
  }

  // Convert to bullet points if enabled
  if (style.formatting.useBulletPoints) {
    formattedContent = addBulletPoints(formattedContent);
  }

  return formattedContent;
}

function addEmoji(content: string): string {
  const emojiMap: Record<string, string> = {
    'important': '⚠️',
    'note': '📝',
    'tip': '💡',
    'warning': '⚠️',
    'success': '✅',
    'error': '❌',
    'idea': '💡',
    'info': 'ℹ️',
    'star': '⭐',
    'time': '⏰'
  };

  let result = content;
  Object.entries(emojiMap).forEach(([word, emoji]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, `${emoji} ${word}`);
  });

  return result;
}

function addHashtags(content: string): string {
  // Extract important words and convert them to hashtags
  const words = content.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || [];
  const hashtags = [...new Set(words)].map(word => `#${word}`).join(' ');
  return `${content}\n\n${hashtags}`;
}

function addBulletPoints(content: string): string {
  // Convert sentences or paragraphs to bullet points
  return content
    .split(/\.\s+/)
    .filter(sentence => sentence.trim().length > 0)
    .map(sentence => `• ${sentence.trim()}`)
    .join('\n');
}
