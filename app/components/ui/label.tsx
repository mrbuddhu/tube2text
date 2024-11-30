'use client';

import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  optional?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  className = '',
  optional = false,
  ...props
}) => {
  return (
    <label
      className={`
        block text-sm font-medium text-gray-700 dark:text-gray-300
        ${className}
      `}
      {...props}
    >
      {children}
      {optional && (
        <span className="ml-1 text-sm text-gray-500">
          (optional)
        </span>
      )}
    </label>
  );
};
