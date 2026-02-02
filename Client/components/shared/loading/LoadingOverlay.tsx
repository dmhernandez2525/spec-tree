'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';
import type { LoadingOverlayProps } from './types';

/**
 * Loading overlay that covers content during async operations.
 * Useful for blocking UI during form submissions or data updates.
 *
 * @example
 * ```tsx
 * <LoadingOverlay isLoading={isSubmitting} message="Saving...">
 *   <form>...</form>
 * </LoadingOverlay>
 * ```
 */
const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    {
      isLoading,
      children,
      message = 'Loading...',
      blur = true,
      className,
    },
    ref
  ) => {
    if (!isLoading) {
      return <>{children}</>;
    }

    return (
      <div ref={ref} className={cn('relative', className)}>
        {children}
        <div
          role="status"
          aria-label={message}
          aria-live="polite"
          className={cn(
            'absolute inset-0 z-50 flex flex-col items-center justify-center',
            'bg-background/80',
            blur && 'backdrop-blur-sm'
          )}
        >
          <div className="flex flex-col items-center gap-3 rounded-lg bg-card p-6 shadow-lg">
            <LoadingSpinner size="lg" variant="primary" />
            {message && (
              <p className="text-sm font-medium text-muted-foreground">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

/**
 * Full-screen loading overlay for page-level operations
 */
const FullScreenLoadingOverlay = React.forwardRef<
  HTMLDivElement,
  Omit<LoadingOverlayProps, 'children'>
>(({ isLoading, message = 'Loading...', blur = true, className }, ref) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="status"
      aria-label={message}
      aria-live="polite"
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-background/80',
        blur && 'backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 shadow-lg">
        <LoadingSpinner size="xl" variant="primary" />
        {message && (
          <p className="text-base font-medium text-muted-foreground">
            {message}
          </p>
        )}
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
});

FullScreenLoadingOverlay.displayName = 'FullScreenLoadingOverlay';

export { LoadingOverlay, FullScreenLoadingOverlay };
