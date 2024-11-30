'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UserCredits {
  credits: number;
  loading: boolean;
  error: Error | null;
  refetchCredits: () => Promise<void>;
  useCredits: (amount: number) => Promise<boolean>;
}

export function useCredits(): UserCredits {
  const { userId } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setCredits(data?.credits || 0);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching credits:', err);
    } finally {
      setLoading(false);
    }
  };

  const useCredits = async (amount: number): Promise<boolean> => {
    try {
      if (credits < amount) {
        throw new Error('Insufficient credits');
      }

      const { error } = await supabase.rpc('use_credits', {
        user_id: userId,
        amount: amount,
      });

      if (error) throw error;

      // Update local state
      setCredits((prev) => prev - amount);
      return true;
    } catch (err) {
      console.error('Error using credits:', err);
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCredits();
    }
  }, [userId]);

  return {
    credits,
    loading,
    error,
    refetchCredits: fetchCredits,
    useCredits,
  };
}
