'use client';

import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  CursorArrowRaysIcon,
  ClockIcon,
  LanguageIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Instant Transcription',
    description: 'Convert any YouTube video into text in seconds, no waiting required.',
    icon: ClockIcon,
  },
  {
    name: 'Smart Formatting',
    description: 'AI-powered formatting creates well-structured articles with proper paragraphs.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Multiple Export Formats',
    description: 'Export your articles in TXT, MD, or HTML format for maximum flexibility.',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Cloud Storage',
    description: 'All your conversions are securely stored and accessible from anywhere.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'One-Click Sharing',
    description: 'Share your transcribed content instantly with team members or clients.',
    icon: CursorArrowRaysIcon,
  },
  {
    name: 'Multi-Language Support',
    description: 'Support for videos in multiple languages with accurate transcription.',
    icon: LanguageIcon,
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to convert videos to text
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Professional tools for content creators, journalists, and researchers.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
