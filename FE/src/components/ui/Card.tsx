'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'raised' | 'overlay';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'raised',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    base: 'bg-slate-950 border border-slate-850',
    raised: 'bg-slate-900 border border-slate-800 shadow-sm',
    overlay: 'bg-slate-850 border border-slate-700 shadow-md',
  }[variant];

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  }[padding];

  return (
    <div className={`rounded-xl ${variantStyles} ${paddingStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
