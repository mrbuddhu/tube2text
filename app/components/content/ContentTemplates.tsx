'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface Template {
  id: string;
  name: string;
  description: string;
  format: string;
}

const templates: Template[] = [
  {
    id: 'blog',
    name: 'Blog Post',
    description: 'Convert video content into a well-structured blog post',
    format: 'markdown'
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Create engaging social media posts from video content',
    format: 'text'
  },
  {
    id: 'summary',
    name: 'Summary',
    description: 'Generate a concise summary of the video content',
    format: 'text'
  },
  {
    id: 'transcript',
    name: 'Full Transcript',
    description: 'Get a complete word-for-word transcript of the video',
    format: 'text'
  }
];

interface ContentTemplatesProps {
  onSelect: (template: Template) => void;
}

export const ContentTemplates: React.FC<ContentTemplatesProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => onSelect(template)}
        >
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {template.description}
            </p>
            <div className="mt-4">
              <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                {template.format}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
