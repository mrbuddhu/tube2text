'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import VideoInput from '../components/VideoInput';
import ArticlePreview from '../components/ArticlePreview';
import ConversionHistory from '../components/ConversionHistory';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleTranscriptionComplete = (transcription: string) => {
    setArticleContent(transcription);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Convert your YouTube videos into well-structured articles
          </p>
        </div>

        <div className="mt-12 space-y-12">
          <VideoInput onTranscriptionComplete={handleTranscriptionComplete} />
          <ArticlePreview content={articleContent} />
          <ConversionHistory />
        </div>
      </div>
    </div>
  );
}
