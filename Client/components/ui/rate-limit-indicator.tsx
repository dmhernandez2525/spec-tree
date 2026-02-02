'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RateLimitStatus } from '@/lib/hooks/useRateLimitStatus';

interface RateLimitIndicatorProps {
  status: RateLimitStatus;
  className?: string;
}

/**
 * Visual indicator for rate limit status
 * Shows retry countdown and status messages
 */
export function RateLimitIndicator({ status, className }: RateLimitIndicatorProps) {
  if (!status.isRateLimited) {
    return null;
  }

  const secondsRemaining = Math.ceil(status.remainingDelayMs / 1000);
  const isWaiting = status.remainingDelayMs > 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
        'bg-amber-50 border border-amber-200 text-amber-800',
        'dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {isWaiting ? (
        <>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            Rate limited. Retrying in {secondsRemaining}s...
            {status.retryAttempt > 1 && ` (attempt ${status.retryAttempt})`}
          </span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 flex-shrink-0 animate-spin" />
          <span>{status.message || 'Retrying...'}</span>
        </>
      )}
    </div>
  );
}

export default RateLimitIndicator;
