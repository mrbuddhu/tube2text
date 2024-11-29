'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus, Save } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  type: 'article' | 'social' | 'summary';
}

const TEMPLATES_KEY = 'tube2text_templates';

export function ContentTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    type: 'article'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  function loadTemplates() {
    try {
      const saved = localStorage.getItem(TEMPLATES_KEY);
      if (saved) {
        setTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  function saveTemplates(updatedTemplates: Template[]) {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }

  function handleAddTemplate() {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const template: Template = {
      id: Math.random().toString(36).substring(7),
      name: newTemplate.name,
      description: newTemplate.description || '',
      content: newTemplate.content,
      type: newTemplate.type as 'article' | 'social' | 'summary'
    };

    saveTemplates([...templates, template]);
    setNewTemplate({ type: 'article' });
    
    toast({
      title: "Template Added",
      description: "Your template has been saved successfully.",
    });
  }

  function handleDeleteTemplate(id: string) {
    const updatedTemplates = templates.filter(t => t.id !== id);
    saveTemplates(updatedTemplates);
    
    toast({
      title: "Template Deleted",
      description: "The template has been removed.",
    });
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Content Templates</h2>
        
        {/* Add New Template */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Add New Template</h3>
          <div className="space-y-4">
            <Input
              placeholder="Template Name"
              value={newTemplate.name || ''}
              onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newTemplate.description || ''}
              onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
            />
            <select
              className="w-full p-2 border rounded-md"
              value={newTemplate.type}
              onChange={e => setNewTemplate({ ...newTemplate, type: e.target.value as Template['type'] })}
            >
              <option value="article">Article</option>
              <option value="social">Social Post</option>
              <option value="summary">Summary</option>
            </select>
            <Textarea
              placeholder="Template Content"
              value={newTemplate.content || ''}
              onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
              rows={5}
            />
            <Button onClick={handleAddTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>

        {/* Template List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Templates</h3>
          {templates.length === 0 ? (
            <p className="text-muted-foreground">No templates yet. Add one above!</p>
          ) : (
            <div className="space-y-4">
              {templates.map(template => (
                <Card key={template.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      {template.description && (
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {template.type}
                        </span>
                      </div>
                      <pre className="mt-2 p-2 bg-muted rounded-md text-sm">
                        {template.content}
                      </pre>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
