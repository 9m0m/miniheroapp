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
    'inline-flex items-center justify-center font-bold tracking-wide rounded-md transition-[background,border-color,transform,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[40px] gap-1.5',
    md: 'text-xs px-4 py-2 min-h-[44px] gap-2',
    lg: 'text-sm px-5 py-2.5 min-h-[48px] gap-2',
  }[size];

  const variantStyles = {
    primary: 'btn-game-cyan',
    accent: 'btn-game-amber',
    secondary: 'btn-game-dark',
    danger: 'btn-game-danger',
    ghost: 'bg-transparent hover:bg-slate-800/70 active:bg-slate-800 text-slate-300 hover:text-slate-100 border border-transparent',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
