'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    setIsSubmitted(true);
    // Reset form
    setEmail('');
    setFeedback('');
    // Reset submission status after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12">
          {/* Feedback Form */}
          <div className="max-w-xl">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">
              Help Us Improve
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Your feedback helps us make Tube2Text better for everyone.
            </p>
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="feedback" className="sr-only">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    name="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    placeholder="Your feedback"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full transition-all duration-300"
                  >
                    Send Feedback
                  </button>
                </div>
              </div>
            </form>
            {isSubmitted && (
              <div className="mt-4 rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  Thank you for your feedback! We'll review it shortly.
                </p>
              </div>
            )}
          </div>

          {/* Contact and Links */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold leading-8 text-gray-900">Contact</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a
                    href="mailto:contact@sanganak.org"
                    className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    contact@sanganak.org
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-8 text-gray-900">Legal</h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <p className="text-xs leading-5 text-gray-500">
            &copy; {currentYear} Built at{' '}
            <a
              href="https://www.sanganak.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Sanganak
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
