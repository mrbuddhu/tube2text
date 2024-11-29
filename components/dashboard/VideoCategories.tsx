'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, Tag, Edit2, Save } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { useUser } from "@clerk/nextjs";

interface Category {
  id: string;
  name: string;
  color: string;
  video_count: number;
}

interface VideoCategory {
  video_id: string;
  category_id: string;
}

export function VideoCategories() {
  const { user } = useUser();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Predefined colors for categories
  const COLORS = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800'
  ];

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  async function fetchCategories() {
    const { data, error } = await supabaseAdmin
      .from('video_categories')
      .select(`
        id,
        name,
        color,
        video_count:video_category_mapping(count)
      `)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  }

  async function addCategory() {
    if (!newCategory.trim() || !user) return;

    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const { error } = await supabaseAdmin
      .from('video_categories')
      .insert({
        name: newCategory,
        color: randomColor,
        user_id: user.id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
      return;
    }

    setNewCategory('');
    fetchCategories();
  }

  async function deleteCategory(id: string) {
    const { error } = await supabaseAdmin
      .from('video_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
      return;
    }

    fetchCategories();
  }

  async function updateCategory(id: string) {
    if (!editName.trim()) return;

    const { error } = await supabaseAdmin
      .from('video_categories')
      .update({ name: editName })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
      return;
    }

    setEditingId(null);
    fetchCategories();
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Video Categories</h2>

      {/* Add new category */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="max-w-xs"
        />
        <Button
          onClick={addCategory}
          disabled={!newCategory.trim()}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Categories list */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories yet</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-gray-500" />
                
                {editingId === category.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 w-40"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCategory(category.id)}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary">
                      {category.video_count} videos
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {editingId !== category.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(category.id);
                      setEditName(category.name);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => deleteCategory(category.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
