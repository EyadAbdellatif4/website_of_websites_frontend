import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="font-semibold text-lg text-zinc-100">{title}</h3>}
          {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
