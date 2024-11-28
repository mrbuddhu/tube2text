'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EARLY_BIRD_PRICE = 249;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await login();
      toast.success('Welcome to your free trial!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to home
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Start Your Free Trial</h2>
          <p className="text-gray-600 mb-8">
            Try all features free for 24 hours. No credit card required.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">What you get</span>
              </div>
            </div>

            <ul className="mt-6 space-y-4 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2" />
                Unlimited video transcriptions
              </li>
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2" />
                AI-powered article formatting
              </li>
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2" />
                Export to PDF, Word, and Markdown
              </li>
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2" />
                Priority email support
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          After the trial, continue with lifetime access for ${EARLY_BIRD_PRICE}
        </p>
      </div>
    </div>
  );
}
