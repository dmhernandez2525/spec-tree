'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LoadingSpinnerProps, LoadingSize } from './types';
import { LOADING_SIZES } from './types';

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted-foreground',
} as const;

/**
 * Standardized loading spinner component.
 * Uses Lucide's Loader2 icon with consistent sizing and styling.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" variant="primary" />
 * ```
 */
const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      size = 'md',
      variant = 'primary',
      className,
      'aria-label': ariaLabel = 'Loading',
      ...props
    },
    ref
  ) => {
    const spinnerSize = LOADING_SIZES[size].spinner;

    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <Loader2
          className={cn('animate-spin', variantStyles[variant])}
          size={spinnerSize}
          aria-hidden="true"
        />
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Full-page loading spinner for route transitions
 */
const PageLoadingSpinner = React.forwardRef<
  HTMLDivElement,
  Omit<LoadingSpinnerProps, 'size'> & { message?: string }
>(({ message = 'Loading...', className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-[70vh] w-full flex-col items-center justify-center gap-4',
        className
      )}
    >
      <LoadingSpinner size="lg" {...props} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
});

PageLoadingSpinner.displayName = 'PageLoadingSpinner';

/**
 * Inline loading indicator for buttons and text
 */
const InlineLoadingSpinner = React.forwardRef<
  HTMLSpanElement,
  Omit<LoadingSpinnerProps, 'size'> & { size?: LoadingSize }
>(({ size = 'sm', className, ...props }, ref) => {
  const spinnerSize = LOADING_SIZES[size].spinner;

  return (
    <span
      ref={ref}
      className={cn('inline-flex items-center', className)}
      role="status"
    >
      <Loader2
        className={cn('animate-spin', variantStyles[props.variant || 'default'])}
        size={spinnerSize}
        aria-hidden="true"
      />
    </span>
  );
});

InlineLoadingSpinner.displayName = 'InlineLoadingSpinner';

export { LoadingSpinner, PageLoadingSpinner, InlineLoadingSpinner };
