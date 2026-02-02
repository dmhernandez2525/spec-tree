'use client';

import { useState, useCallback, useRef } from 'react';
import type { RateLimitError } from '@/lib/utils/rate-limit';
import { getRateLimitMessage } from '@/lib/utils/rate-limit';

export interface RateLimitStatus {
  isRateLimited: boolean;
  retryAttempt: number;
  retryDelayMs: number;
  message: string | null;
  remainingDelayMs: number;
}

interface UseRateLimitStatusReturn {
  status: RateLimitStatus;
  onRateLimitRetry: (attempt: number, delayMs: number, error: RateLimitError) => void;
  clearRateLimitStatus: () => void;
  isRetrying: boolean;
}

const initialStatus: RateLimitStatus = {
  isRateLimited: false,
  retryAttempt: 0,
  retryDelayMs: 0,
  message: null,
  remainingDelayMs: 0,
};

/**
 * Hook for managing rate limit status in UI components
 * Provides callbacks for the OpenAI proxy and exposes status for UI display
 */
export function useRateLimitStatus(): UseRateLimitStatusReturn {
  const [status, setStatus] = useState<RateLimitStatus>(initialStatus);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRateLimitStatus = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus(initialStatus);
  }, []);

  const onRateLimitRetry = useCallback(
    (attempt: number, delayMs: number, error: RateLimitError) => {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const message = getRateLimitMessage(error);

      setStatus({
        isRateLimited: true,
        retryAttempt: attempt,
        retryDelayMs: delayMs,
        message,
        remainingDelayMs: delayMs,
      });

      // Update remaining delay every 100ms for smooth countdown
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, delayMs - elapsed);

        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setStatus((prev) => ({
            ...prev,
            remainingDelayMs: 0,
            message: `Retrying... (attempt ${attempt})`,
          }));
        } else {
          setStatus((prev) => ({
            ...prev,
            remainingDelayMs: remaining,
          }));
        }
      }, 100);
    },
    []
  );

  return {
    status,
    onRateLimitRetry,
    clearRateLimitStatus,
    isRetrying: status.isRateLimited && status.remainingDelayMs > 0,
  };
}

export default useRateLimitStatus;
