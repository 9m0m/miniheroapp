'use client';

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Mandatory for accessibility
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';
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
    'inline-flex items-center justify-center rounded-md transition-[background,border-color,transform,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer active:scale-95';

  const sizeStyles = {
    sm: 'p-2 min-w-[40px] min-h-[40px]',
    md: 'p-2.5 min-w-[44px] min-h-[44px]',
    lg: 'p-3 min-w-[48px] min-h-[48px]',
  }[size];

  const variantStyles = {
    primary: 'btn-game-cyan',
    accent: 'btn-game-amber',
    secondary: 'btn-game-dark',
    danger: 'btn-game-danger',
    ghost: 'bg-transparent hover:bg-slate-800/80 active:bg-slate-800 text-slate-400 hover:text-slate-100 border border-transparent',
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

export default IconButton;
