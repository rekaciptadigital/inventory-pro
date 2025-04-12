import React from 'react';

interface CodeProps {
  children: React.ReactNode;
  language?: string;
  className?: string;
}

export function Code({ children, language, className = '' }: Readonly<CodeProps>) {
  return (
    <pre
      className={`bg-muted text-sm p-4 rounded-md overflow-auto ${className}`}
      style={{ maxHeight: '400px' }}
    >
      <code className={language ? `language-${language}` : ''}>
        {children}
      </code>
    </pre>
  );
}
