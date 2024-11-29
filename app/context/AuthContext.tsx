'use client';

import React, { createContext, useContext } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

interface User {
  email: string;
  name?: string;
  image?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const user: User | null = clerkUser ? {
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: clerkUser.fullName || '',
    image: clerkUser.imageUrl || '',
  } : null;

  const login = async () => {
    try {
      window.location.href = '/sign-in';
    } catch (error) {
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      window.location.href = '/sign-out';
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!userId, 
      user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
