import { Metadata } from 'next';
import { HomePageClient } from './components/HomePageClient';

export const metadata: Metadata = {
  title: 'Tube2Text - Transform YouTube Videos into Articles',
  description: 'Convert YouTube videos into well-written articles using AI. Perfect for content creators, journalists, and researchers.',
  keywords: ['YouTube to text', 'video transcription', 'content creation', 'AI writing'],
  openGraph: {
    title: 'Tube2Text - Transform YouTube Videos into Articles',
    description: 'Convert YouTube videos into well-written articles using AI',
    url: 'https://tube2text.vercel.app',
    siteName: 'Tube2Text',
    images: [
      {
        url: 'https://tube2text.vercel.app/og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tube2Text - Transform YouTube Videos into Articles',
    description: 'Convert YouTube videos into well-written articles using AI',
    images: ['https://tube2text.vercel.app/og.png'],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
