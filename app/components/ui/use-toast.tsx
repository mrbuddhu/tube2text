'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  title?: string;
  description: string;
  type?: 'default' | 'success' | 'error' | 'warning';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              max-w-sm w-full bg-white dark:bg-gray-800
              shadow-lg rounded-lg pointer-events-auto
              ring-1 ring-black ring-opacity-5
              ${
                toast.type === 'success'
                  ? 'border-l-4 border-green-500'
                  : toast.type === 'error'
                  ? 'border-l-4 border-red-500'
                  : toast.type === 'warning'
                  ? 'border-l-4 border-yellow-500'
                  : ''
              }
            `}
          >
            <div className="p-4">
              {toast.title && (
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {toast.title}
                </div>
              )}
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {toast.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
