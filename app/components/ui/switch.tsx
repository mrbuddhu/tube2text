'use client';

import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`
            block w-14 h-8 rounded-full transition-colors duration-200
            ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        <div
          className={`
            absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out
            ${checked ? 'transform translate-x-6' : ''}
          `}
        />
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          {label}
        </span>
      )}
    </label>
  );
};
