'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isPaidUser: boolean;
  signIn: () => void;
  signOut: () => void;
  upgradeToProUser: () => void;
  upgradeToEnterpriseUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);

  useEffect(() => {
    // Check localStorage for existing auth state
    const authState = localStorage?.getItem('tube2text_auth');
    const userType = localStorage?.getItem('tube2text_user_type');
    if (authState === 'true') {
      setIsAuthenticated(true);
      setIsPaidUser(userType === 'pro' || userType === 'enterprise');
    }
  }, []);

  const signIn = () => {
    if (typeof window === 'undefined') return;
    setIsAuthenticated(true);
    localStorage.setItem('tube2text_auth', 'true');
  };

  const signOut = () => {
    if (typeof window === 'undefined') return;
    setIsAuthenticated(false);
    setIsPaidUser(false);
    localStorage.removeItem('tube2text_auth');
    localStorage.removeItem('tube2text_user_type');
  };

  const upgradeToProUser = () => {
    if (typeof window === 'undefined') return;
    setIsPaidUser(true);
    localStorage.setItem('tube2text_user_type', 'pro');
  };

  const upgradeToEnterpriseUser = () => {
    if (typeof window === 'undefined') return;
    setIsPaidUser(true);
    localStorage.setItem('tube2text_user_type', 'enterprise');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isPaidUser, 
      signIn, 
      signOut,
      upgradeToProUser,
      upgradeToEnterpriseUser
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
