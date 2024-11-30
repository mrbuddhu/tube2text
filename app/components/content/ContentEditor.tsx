'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

interface ContentEditorProps {
  content: string;
  onSave: (content: string) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ content, onSave }) => {
  const [editedContent, setEditedContent] = React.useState(content);
  const { addToast } = useToast();

  const handleSave = () => {
    onSave(editedContent);
    addToast({
      title: 'Success',
      description: 'Content saved successfully',
      type: 'success',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-96 p-4 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Edit your content here..."
          />
          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
