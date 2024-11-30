'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  count: number;
}

export const VideoCategories = () => {
  const { userId } = useAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [newCategory, setNewCategory] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId]);

  const fetchCategories = async () => {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('category')
        .eq('user_id', userId);

      if (error) throw error;

      // Count videos per category
      const categoryCounts = videos.reduce((acc, video) => {
        if (video.category) {
          acc[video.category] = (acc[video.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Convert to array and sort by count
      const categoryArray = Object.entries(categoryCounts).map(
        ([name, count]) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          count,
        })
      ).sort((a, b) => b.count - a.count);

      setCategories(categoryArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      // Add category to user's preferences
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          categories: [...categories.map(c => c.name), newCategory],
        });

      if (error) throw error;

      setCategories([
        ...categories,
        {
          id: newCategory.toLowerCase().replace(/\s+/g, '-'),
          name: newCategory,
          count: 0,
        },
      ]);
      setNewCategory('');

      addToast({
        title: 'Success',
        description: 'Category added successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding category:', error);
      addToast({
        title: 'Error',
        description: 'Failed to add category',
        type: 'error',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      // Remove category from user's preferences
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          categories: categories
            .filter(c => c.id !== categoryId)
            .map(c => c.name),
        });

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== categoryId));

      addToast({
        title: 'Success',
        description: 'Category deleted successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete category',
        type: 'error',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {category.count} videos
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <p className="text-center text-gray-500">
              No categories created yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
