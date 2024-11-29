import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import { Shell } from '@/components/ui/shell';
import { Toaster } from '@/components/ui/toaster';
import { SubscriptionProvider } from '@/context/subscription-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tube2Text - Convert YouTube Videos to Text',
  description: 'Transform YouTube videos into readable articles in seconds using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SubscriptionProvider>
              <Shell>
                {children}
              </Shell>
            </SubscriptionProvider>
          </ThemeProvider>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  )
}
