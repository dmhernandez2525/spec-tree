'use client';

/**
 * Root Error Page
 *
 * F1.1.6 - Error Boundary Implementation
 *
 * Next.js error.tsx file that catches errors at the app level.
 * Uses the ErrorFallback component for consistent UI.
 */

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/error-boundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error tracking service
    if (process.env.NODE_ENV === 'production') {
      console.error('[App Error]', {
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      });
    } else {
      console.error('App error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ErrorFallback
        error={error}
        resetErrorBoundary={reset}
        showStackTrace={process.env.NODE_ENV === 'development'}
        enableReporting={true}
        sectionName="Application"
      />
    </div>
  );
}
