'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <AuthProvider>
        <Toaster position="top-right" />
        {children}
      </AuthProvider>
    </ClerkProvider>
  );
}
