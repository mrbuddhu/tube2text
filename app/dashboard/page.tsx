'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import VideoInput from '../components/VideoInput';
import ArticlePreview from '../components/ArticlePreview';
import ConversionHistory from '../components/ConversionHistory';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articleContent, setArticleContent] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleTranscriptionComplete = (transcription: string) => {
    setArticleContent(transcription);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Transform YouTube Videos</span>
              <span className="block text-indigo-600">Into Readable Articles</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Simply paste a YouTube URL and get an AI-powered article in seconds. Perfect for research, study notes, or content creation.
            </p>
          </div>

          <div className="mt-12 bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="p-6 space-y-8">
              <VideoInput onTranscriptionComplete={handleTranscriptionComplete} />
              
              {articleContent && (
                <div className="mt-8 border-t pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Generated Article</h2>
                  <ArticlePreview content={articleContent} />
                </div>
              )}
              
              <div className="mt-8 border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Conversions</h2>
                <ConversionHistory />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
