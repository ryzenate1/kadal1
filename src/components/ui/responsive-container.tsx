'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: boolean;
  centered?: boolean;
}

/**
 * A responsive container component that adapts to different screen sizes
 */
export function ResponsiveContainer({
  children,
  className,
  as: Component = 'div',
  maxWidth = 'xl',
  padding = true,
  centered = true,
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
    none: '',
  };

  return (
    <Component
      className={cn(
        maxWidthClasses[maxWidth],
        padding && 'px-4 sm:px-6 md:px-8',
        centered && 'mx-auto',
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * A responsive grid component that adapts to different screen sizes
 */
export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'default',
}: {
  children: ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'small' | 'default' | 'large';
}) {
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2 sm:gap-3',
    default: 'gap-4 sm:gap-6',
    large: 'gap-6 sm:gap-8 md:gap-10',
  };

  const getGridCols = (count: number) => {
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      default: return 'grid-cols-1';
    }
  };

  return (
    <div
      className={cn(
        'grid',
        getGridCols(cols.default),
        cols.sm && `sm:${getGridCols(cols.sm)}`,
        cols.md && `md:${getGridCols(cols.md)}`,
        cols.lg && `lg:${getGridCols(cols.lg)}`,
        cols.xl && `xl:${getGridCols(cols.xl)}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
