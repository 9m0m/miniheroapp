'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 min-h-[44px]',
    md: 'text-xs px-3.5 py-2.5 min-h-[44px]',
    lg: 'text-sm px-4 py-2.5 min-h-[48px]',
  }[size];

  const variantStyles = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/40 shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    accent: 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-400 shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 border border-transparent',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
