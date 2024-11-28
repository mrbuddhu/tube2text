import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tube2Text - Convert YouTube Videos to Articles',
  description: 'Transform any YouTube video into a readable article with AI-powered transcription and formatting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <Toaster position="top-right" />
              <main>{children}</main>
            </div>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
