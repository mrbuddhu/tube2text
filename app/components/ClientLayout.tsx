'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Toaster position="top-right" />
          <main>{children}</main>
        </div>
      </AuthProvider>
    </SessionProvider>
  );
}
