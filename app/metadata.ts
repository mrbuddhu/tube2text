import { Metadata } from 'next';

const defaultMetadata: Metadata = {
  title: 'Tube2Text - Transform YouTube Videos into Articles',
  description: 'Convert YouTube videos into well-written articles using AI. Perfect for content creators, journalists, and researchers.',
  keywords: ['YouTube to text', 'video transcription', 'content creation', 'AI writing', 'video to article'],
  authors: [{ name: 'Tube2Text Team' }],
  openGraph: {
    title: 'Tube2Text - Transform YouTube Videos into Articles',
    description: 'Convert YouTube videos into well-written articles using AI',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tube2Text - Video to Article Conversion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tube2Text - Transform YouTube Videos into Articles',
    description: 'Convert YouTube videos into well-written articles using AI',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default defaultMetadata;
