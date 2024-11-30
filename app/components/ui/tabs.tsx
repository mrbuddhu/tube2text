'use client';

import React from 'react';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = '',
}) => {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue: string) => {
    if (value === undefined) {
      setSelectedTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            selectedTab,
            onSelect: handleTabChange,
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
    {children}
  </div>
);

export const TabsTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  selectedTab?: string;
  onSelect?: (value: string) => void;
}> = ({ value, children, selectedTab, onSelect }) => (
  <button
    onClick={() => onSelect?.(value)}
    className={`
      px-4 py-2 text-sm font-medium transition-colors
      ${
        selectedTab === value
          ? 'border-b-2 border-blue-500 text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    {children}
  </button>
);

export const TabsContent: React.FC<{
  value: string;
  children: React.ReactNode;
  selectedTab?: string;
}> = ({ value, children, selectedTab }) => {
  if (selectedTab !== value) return null;
  return <div className="mt-4">{children}</div>
};
