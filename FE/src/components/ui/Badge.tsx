'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent' | 'rarity-common' | 'rarity-uncommon' | 'rarity-rare' | 'rarity-epic' | 'rarity-legendary';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
  }[size];

  const variantStyles = {
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-500/40',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-500/40',
    accent: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40',
    'rarity-common': 'bg-slate-900 text-slate-400 border border-slate-700',
    'rarity-uncommon': 'bg-emerald-950 text-emerald-400 border border-emerald-600/40',
    'rarity-rare': 'bg-blue-950 text-blue-400 border border-blue-600/40',
    'rarity-epic': 'bg-purple-950 text-purple-400 border border-purple-600/40',
    'rarity-legendary': 'bg-amber-950 text-amber-400 border border-amber-600/40',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
