'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LoadingSkeletonProps, LoadingSkeletonCardProps } from './types';

const variantStyles = {
  text: 'rounded-md',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-lg',
} as const;

const sizeStyles = {
  xs: 'h-2',
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-6',
  xl: 'h-8',
} as const;

/**
 * Standardized skeleton loading placeholder.
 * Provides visual feedback for content that is loading.
 *
 * @example
 * ```tsx
 * // Single line skeleton
 * <LoadingSkeleton width="200px" />
 *
 * // Multiple lines
 * <LoadingSkeleton lines={3} />
 *
 * // Avatar placeholder
 * <LoadingSkeleton variant="circular" width={48} height={48} />
 * ```
 */
const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  (
    {
      variant = 'text',
      size = 'md',
      width,
      height,
      lines = 1,
      animate = true,
      className,
      'aria-label': ariaLabel = 'Loading content',
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'bg-muted',
      animate && 'animate-pulse',
      variantStyles[variant],
      !height && sizeStyles[size]
    );

    const style: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };

    if (lines > 1) {
      return (
        <div
          ref={ref}
          role="status"
          aria-label={ariaLabel}
          className={cn('space-y-2', className)}
          {...props}
        >
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(baseStyles, index === lines - 1 && 'w-3/4')}
              style={index === lines - 1 ? {} : style}
            />
          ))}
          <span className="sr-only">{ariaLabel}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn(baseStyles, className)}
        style={style}
        {...props}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    );
  }
);

LoadingSkeleton.displayName = 'LoadingSkeleton';

/**
 * Skeleton placeholder for card content
 */
const LoadingSkeletonCard = React.forwardRef<
  HTMLDivElement,
  LoadingSkeletonCardProps
>(({ showAvatar = true, lines = 3, className }, ref) => {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading card"
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {showAvatar && (
          <LoadingSkeleton
            variant="circular"
            width={40}
            height={40}
            aria-label="Loading avatar"
          />
        )}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton width="60%" size="lg" aria-label="Loading title" />
          <LoadingSkeleton lines={lines} aria-label="Loading content" />
        </div>
      </div>
      <span className="sr-only">Loading card</span>
    </div>
  );
});

LoadingSkeletonCard.displayName = 'LoadingSkeletonCard';

/**
 * Skeleton for table rows
 */
const LoadingSkeletonTable = React.forwardRef<
  HTMLDivElement,
  { rows?: number; columns?: number; className?: string }
>(({ rows = 5, columns = 4, className }, ref) => {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading table"
      className={cn('space-y-3', className)}
    >
      {/* Header */}
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton
            key={`header-${i}`}
            width={`${100 / columns}%`}
            size="md"
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton
              key={`cell-${rowIndex}-${colIndex}`}
              width={`${100 / columns}%`}
              size="sm"
            />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading table</span>
    </div>
  );
});

LoadingSkeletonTable.displayName = 'LoadingSkeletonTable';

/**
 * Skeleton for list items
 */
const LoadingSkeletonList = React.forwardRef<
  HTMLDivElement,
  { items?: number; showIcon?: boolean; className?: string }
>(({ items = 5, showIcon = true, className }, ref) => {
  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading list"
      className={cn('space-y-3', className)}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showIcon && (
            <LoadingSkeleton variant="circular" width={24} height={24} />
          )}
          <div className="flex-1 space-y-1">
            <LoadingSkeleton width="80%" size="sm" />
            <LoadingSkeleton width="50%" size="xs" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading list</span>
    </div>
  );
});

LoadingSkeletonList.displayName = 'LoadingSkeletonList';

export {
  LoadingSkeleton,
  LoadingSkeletonCard,
  LoadingSkeletonTable,
  LoadingSkeletonList,
};
