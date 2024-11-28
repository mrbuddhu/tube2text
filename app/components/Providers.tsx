'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <Toaster position="top-right" />
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
