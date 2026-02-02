import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimitStatus } from './useRateLimitStatus';
import type { RateLimitError } from '@/lib/utils/rate-limit';

describe('useRateLimitStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default status', () => {
    const { result } = renderHook(() => useRateLimitStatus());

    expect(result.current.status.isRateLimited).toBe(false);
    expect(result.current.status.retryAttempt).toBe(0);
    expect(result.current.status.retryDelayMs).toBe(0);
    expect(result.current.status.message).toBeNull();
    expect(result.current.status.remainingDelayMs).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  it('updates status on rate limit retry', () => {
    const { result } = renderHook(() => useRateLimitStatus());

    const error: RateLimitError = {
      status: 429,
      retryAfter: 5000,
      message: 'Rate limited',
      isRateLimited: true,
    };

    act(() => {
      result.current.onRateLimitRetry(1, 5000, error);
    });

    expect(result.current.status.isRateLimited).toBe(true);
    expect(result.current.status.retryAttempt).toBe(1);
    expect(result.current.status.retryDelayMs).toBe(5000);
    expect(result.current.status.remainingDelayMs).toBe(5000);
    expect(result.current.isRetrying).toBe(true);
  });

  it('counts down remaining delay', async () => {
    const { result } = renderHook(() => useRateLimitStatus());

    const error: RateLimitError = {
      status: 429,
      retryAfter: 1000,
      message: 'Rate limited',
      isRateLimited: true,
    };

    act(() => {
      result.current.onRateLimitRetry(1, 1000, error);
    });

    expect(result.current.status.remainingDelayMs).toBe(1000);

    // Advance time by 500ms
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.status.remainingDelayMs).toBeLessThanOrEqual(500);

    // Advance to completion
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.status.remainingDelayMs).toBe(0);
    expect(result.current.isRetrying).toBe(false);
  });

  it('clears status when clearRateLimitStatus is called', () => {
    const { result } = renderHook(() => useRateLimitStatus());

    const error: RateLimitError = {
      status: 429,
      message: 'Rate limited',
      isRateLimited: true,
    };

    act(() => {
      result.current.onRateLimitRetry(1, 5000, error);
    });

    expect(result.current.status.isRateLimited).toBe(true);

    act(() => {
      result.current.clearRateLimitStatus();
    });

    expect(result.current.status.isRateLimited).toBe(false);
    expect(result.current.status.retryAttempt).toBe(0);
    expect(result.current.status.message).toBeNull();
  });

  it('updates message after countdown completes', async () => {
    const { result } = renderHook(() => useRateLimitStatus());

    const error: RateLimitError = {
      status: 429,
      message: 'Rate limited',
      isRateLimited: true,
    };

    act(() => {
      result.current.onRateLimitRetry(2, 200, error);
    });

    // Advance past the delay
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.status.message).toContain('Retrying');
    expect(result.current.status.message).toContain('attempt 2');
  });

  it('handles multiple rapid onRateLimitRetry calls', () => {
    const { result } = renderHook(() => useRateLimitStatus());

    const error1: RateLimitError = {
      status: 429,
      message: 'First error',
      isRateLimited: true,
    };

    const error2: RateLimitError = {
      status: 429,
      message: 'Second error',
      isRateLimited: true,
    };

    act(() => {
      result.current.onRateLimitRetry(1, 5000, error1);
    });

    act(() => {
      result.current.onRateLimitRetry(2, 10000, error2);
    });

    // Should use the latest values
    expect(result.current.status.retryAttempt).toBe(2);
    expect(result.current.status.retryDelayMs).toBe(10000);
  });
});
