'use client';

import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
  };

  return (
    <div
      role="alert"
      className={`p-4 rounded-lg ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm">{children}</div>
);
