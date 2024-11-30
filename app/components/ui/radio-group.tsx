'use client';

import React from 'react';

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
};

interface RadioGroupItemProps {
  value: string;
  checked?: boolean;
  onChange?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  checked,
  onChange,
  children,
  className = '',
}) => {
  return (
    <label className={`flex items-center space-x-2 cursor-pointer ${className}`}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {children}
      </span>
    </label>
  );
};
