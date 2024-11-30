'use client';

import React from 'react';

export interface ToastProps {
  title?: string;
  description: string;
  type?: 'default' | 'success' | 'error' | 'warning';
  onClose?: () => void;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const ToastViewport: React.FC = () => {
  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
  );
};

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = 'default',
  onClose,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      {title && <ToastTitle>{title}</ToastTitle>}
      <ToastDescription>{description}</ToastDescription>
      <ToastClose onClick={onClose} />
    </div>
  );
};

export const ToastTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm font-semibold mb-1">{children}</div>
);

export const ToastDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-gray-500">{children}</div>
);

export const ToastClose: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
  >
    <span className="sr-only">Close</span>
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  </button>
);
