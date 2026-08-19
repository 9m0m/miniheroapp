'use client';

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Mandatory for accessibility
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  type = 'button',
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 'md',
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95';

  const sizeStyles = {
    sm: 'p-2.5 min-w-[44px] min-h-[44px]',
    md: 'p-2.5 min-w-[44px] min-h-[44px]',
    lg: 'p-3 min-w-[48px] min-h-[48px]',
  }[size];

  const variantStyles = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/40',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    danger: 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200',
  }[variant];

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
