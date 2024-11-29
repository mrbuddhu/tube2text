export interface ExportData {
  videoId: string;
  title: string;
  transcript: string;
  summary: string;
  article: string;
  socialPosts: {
    twitter: string;
    linkedin: string;
    facebook: string;
  };
  metadata: {
    processedAt: string;
    duration: string;
    language: string;
  };
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(data: ExportData): string {
  const headers = [
    'Video ID',
    'Title',
    'Summary',
    'Twitter Post',
    'LinkedIn Post',
    'Facebook Post',
    'Processed At',
    'Duration',
    'Language'
  ].join(',');

  const values = [
    data.videoId,
    `"${data.title.replace(/"/g, '""')}"`,
    `"${data.summary.replace(/"/g, '""')}"`,
    `"${data.socialPosts.twitter.replace(/"/g, '""')}"`,
    `"${data.socialPosts.linkedin.replace(/"/g, '""')}"`,
    `"${data.socialPosts.facebook.replace(/"/g, '""')}"`,
    data.metadata.processedAt,
    data.metadata.duration,
    data.metadata.language
  ].join(',');

  return `${headers}\n${values}`;
}

export function exportToMarkdown(data: ExportData): string {
  return `# ${data.title}

## Summary
${data.summary}

## Article
${data.article}

## Social Media Posts

### Twitter
${data.socialPosts.twitter}

### LinkedIn
${data.socialPosts.linkedin}

### Facebook
${data.socialPosts.facebook}

## Metadata
- Processed: ${data.metadata.processedAt}
- Duration: ${data.metadata.duration}
- Language: ${data.metadata.language}
`;
}

export function exportToText(data: ExportData): string {
  return `Title: ${data.title}

Summary:
${data.summary}

Full Transcript:
${data.transcript}

Article:
${data.article}

Social Media Posts:
Twitter: ${data.socialPosts.twitter}
LinkedIn: ${data.socialPosts.linkedin}
Facebook: ${data.socialPosts.facebook}

Metadata:
Processed: ${data.metadata.processedAt}
Duration: ${data.metadata.duration}
Language: ${data.metadata.language}
`;
}
