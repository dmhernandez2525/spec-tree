'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/lib/logger';
import type { UseLoadingStateResult } from './types';

const DEFAULT_MESSAGES = {
  initial: 'Loading...',
  extended: 'This is taking longer than expected...',
  prolonged: 'Still working on it...',
};

const EXTENDED_TIMEOUT = 10000; // 10 seconds
const PROLONGED_TIMEOUT = 20000; // 20 seconds

/**
 * Hook for managing loading states with progressive messages.
 * Provides standardized loading state management with timeout-based message updates.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isLoading, message, startLoading, stopLoading, withLoading } = useLoadingState();
 *
 *   const handleFetch = async () => {
 *     await withLoading(async () => {
 *       const data = await fetchData();
 *       return data;
 *     }, { message: 'Fetching data...' });
 *   };
 *
 *   return (
 *     <div>
 *       {isLoading && <LoadingSpinner />}
 *       <p>{message}</p>
 *       <button onClick={handleFetch}>Fetch</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLoadingState(
  initialMessage: string = DEFAULT_MESSAGES.initial
): UseLoadingStateResult {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(initialMessage);

  const extendedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prolongedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (extendedTimeoutRef.current) {
        clearTimeout(extendedTimeoutRef.current);
      }
      if (prolongedTimeoutRef.current) {
        clearTimeout(prolongedTimeoutRef.current);
      }
    };
  }, []);

  const clearTimeouts = useCallback(() => {
    if (extendedTimeoutRef.current) {
      clearTimeout(extendedTimeoutRef.current);
      extendedTimeoutRef.current = null;
    }
    if (prolongedTimeoutRef.current) {
      clearTimeout(prolongedTimeoutRef.current);
      prolongedTimeoutRef.current = null;
    }
  }, []);

  const startLoading = useCallback((customMessage?: string) => {
    clearTimeouts();

    setIsLoading(true);
    setMessage(customMessage || DEFAULT_MESSAGES.initial);

    logger.debug('loading.start', 'Loading started', {
      message: customMessage || DEFAULT_MESSAGES.initial,
    });

    // Set up progressive message updates
    extendedTimeoutRef.current = setTimeout(() => {
      setMessage(DEFAULT_MESSAGES.extended);
      logger.debug('loading.extended', 'Loading taking longer than expected');
    }, EXTENDED_TIMEOUT);

    prolongedTimeoutRef.current = setTimeout(() => {
      setMessage(DEFAULT_MESSAGES.prolonged);
      logger.debug('loading.prolonged', 'Loading prolonged');
    }, PROLONGED_TIMEOUT);
  }, [clearTimeouts]);

  const stopLoading = useCallback(() => {
    clearTimeouts();
    setIsLoading(false);
    setMessage(DEFAULT_MESSAGES.initial);

    logger.debug('loading.stop', 'Loading stopped');
  }, [clearTimeouts]);

  const withLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: { message?: string; successMessage?: string }
    ): Promise<T | null> => {
      startLoading(options?.message);

      try {
        const result = await operation();

        if (options?.successMessage) {
          setMessage(options.successMessage);
          // Brief delay to show success message
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        return result;
      } catch (error) {
        logger.error('loading.error', 'Error during loading operation', {
          error,
        });
        return null;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    message,
    startLoading,
    stopLoading,
    setMessage,
    withLoading,
  };
}
