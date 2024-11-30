'use client';

import React from 'react';
import { Toast } from './toast';

interface ToastProps {
  id: string;
  title?: string;
  description: string;
  type?: 'default' | 'success' | 'error' | 'warning';
}

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  React.useEffect(() => {
    const handleToast = (event: CustomEvent<ToastProps>) => {
      const newToast = {
        id: event.detail.id || Math.random().toString(36).substr(2, 9),
        title: event.detail.title,
        description: event.detail.description,
        type: event.detail.type,
      };

      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('toast' as any, handleToast as any);

    return () => {
      window.removeEventListener('toast' as any, handleToast as any);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div
      className="fixed bottom-0 right-0 p-4 space-y-4 z-50 max-h-screen overflow-hidden pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
