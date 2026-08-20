'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'accent'
    | 'rarity-common'
    | 'rarity-uncommon'
    | 'rarity-rare'
    | 'rarity-epic'
    | 'rarity-legendary'
    | 'rarity-mythic'
    | 'rarity-ancient';
  size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'text-[9px] px-1.5 py-0.5 leading-none',
    sm: 'text-[10px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-normal',
  }[size];

  const variantStyles = {
    neutral: 'bg-slate-900/90 text-slate-300 border border-slate-700/80',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/10',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/10',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-500/10',
    accent: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10',
    'rarity-common': 'bg-slate-900/90 text-slate-400 border border-slate-700',
    'rarity-uncommon': 'bg-emerald-950 text-emerald-400 border border-emerald-500/60 shadow-sm shadow-emerald-500/15',
    'rarity-rare': 'bg-blue-950 text-blue-400 border border-blue-500/60 shadow-sm shadow-blue-500/15',
    'rarity-epic': 'bg-purple-950 text-purple-400 border border-purple-500/60 shadow-sm shadow-purple-500/15',
    'rarity-legendary': 'bg-amber-950 text-amber-300 border border-amber-500/70 shadow-sm shadow-amber-500/20 font-bold',
    'rarity-mythic': 'bg-red-950 text-red-400 border border-red-500/70 shadow-sm shadow-red-500/20 font-bold',
    'rarity-ancient': 'bg-pink-950 text-pink-300 border border-pink-500/70 shadow-sm shadow-pink-500/20 font-bold',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-sm tracking-wide ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
