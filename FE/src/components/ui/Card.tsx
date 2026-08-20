'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'raised' | 'overlay' | 'accent-amber' | 'accent-cyan';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'raised',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    base: 'plate-base',
    raised: 'plate-raised',
    overlay: 'plate-overlay',
    'accent-amber': 'plate-accent-amber',
    'accent-cyan': 'plate-accent-cyan',
  }[variant];

  const paddingStyles = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-2.5',
    md: 'p-3.5',
    lg: 'p-4',
  }[padding];

  return (
    <div className={`rounded-lg ${variantStyles} ${paddingStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
