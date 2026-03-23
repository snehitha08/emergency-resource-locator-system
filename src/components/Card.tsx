import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  key?: any;
}

export function Card({ children, className, title, description }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm', className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          {description && <p className="text-sm text-zinc-500">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
