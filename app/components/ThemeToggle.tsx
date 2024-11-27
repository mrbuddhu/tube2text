'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-6 h-6" />; // Placeholder with same dimensions
  }

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
      aria-label="Toggle theme"
    >
      {theme === 'light' && (
        <SunIcon className="w-5 h-5 text-yellow-500 transition-transform duration-200 hover:rotate-45" />
      )}
      {theme === 'dark' && (
        <MoonIcon className="w-5 h-5 text-indigo-400 transition-transform duration-200 hover:-rotate-12" />
      )}
      {theme === 'system' && (
        <ComputerDesktopIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 hover:scale-110" />
      )}
    </button>
  );
}
