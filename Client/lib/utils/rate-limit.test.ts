import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateBackoffDelay,
  parseRetryAfterHeader,
  isRateLimitError,
  createRateLimitError,
  getRateLimitMessage,
  withRateLimitRetry,
  RATE_LIMIT_DEFAULT_CONFIG,
} from './rate-limit';

describe('rate-limit', () => {
  describe('calculateBackoffDelay', () => {
    it('calculates exponential backoff for attempt 0', () => {
      const delay = calculateBackoffDelay(0, 1000, 30000);
      // Base delay is 1000ms, with ±25% jitter
      expect(delay).toBeGreaterThanOrEqual(750);
      expect(delay).toBeLessThanOrEqual(1250);
    });

    it('calculates exponential backoff for attempt 1', () => {
      const delay = calculateBackoffDelay(1, 1000, 30000);
      // 2^1 * 1000 = 2000ms, with ±25% jitter
      expect(delay).toBeGreaterThanOrEqual(1500);
      expect(delay).toBeLessThanOrEqual(2500);
    });

    it('calculates exponential backoff for attempt 2', () => {
      const delay = calculateBackoffDelay(2, 1000, 30000);
      // 2^2 * 1000 = 4000ms, with ±25% jitter
      expect(delay).toBeGreaterThanOrEqual(3000);
      expect(delay).toBeLessThanOrEqual(5000);
    });

    it('respects maxDelayMs cap', () => {
      const delay = calculateBackoffDelay(10, 1000, 5000);
      // Should be capped at maxDelayMs
      expect(delay).toBeLessThanOrEqual(5000);
    });

    it('uses retry-after value when provided', () => {
      const delay = calculateBackoffDelay(0, 1000, 30000, 5000);
      expect(delay).toBe(5000);
    });

    it('caps retry-after at maxDelayMs', () => {
      const delay = calculateBackoffDelay(0, 1000, 10000, 60000);
      expect(delay).toBe(10000);
    });
  });

  describe('parseRetryAfterHeader', () => {
    it('parses numeric seconds from Headers object', () => {
      const headers = new Headers({ 'retry-after': '30' });
      expect(parseRetryAfterHeader(headers)).toBe(30000);
    });

    it('parses numeric seconds from plain object', () => {
      expect(parseRetryAfterHeader({ 'retry-after': '60' })).toBe(60000);
    });

    it('parses Retry-After with capital letters', () => {
      expect(parseRetryAfterHeader({ 'Retry-After': '45' })).toBe(45000);
    });

    it('parses HTTP date format', () => {
      const futureDate = new Date(Date.now() + 10000);
      const headers = new Headers({
        'retry-after': futureDate.toUTCString(),
      });
      const result = parseRetryAfterHeader(headers);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(10100); // Allow small variance
    });

    it('returns undefined for missing header', () => {
      expect(parseRetryAfterHeader(new Headers())).toBeUndefined();
      expect(parseRetryAfterHeader({})).toBeUndefined();
    });

    it('returns undefined for invalid value', () => {
      expect(parseRetryAfterHeader({ 'retry-after': 'invalid' })).toBeUndefined();
    });
  });

  describe('isRateLimitError', () => {
    it('returns true for 429 status', () => {
      expect(isRateLimitError(429)).toBe(true);
    });

    it('returns true for 503 status', () => {
      expect(isRateLimitError(503)).toBe(true);
    });

    it('returns true for 502 status', () => {
      expect(isRateLimitError(502)).toBe(true);
    });

    it('returns true for 504 status', () => {
      expect(isRateLimitError(504)).toBe(true);
    });

    it('returns false for 500 status', () => {
      expect(isRateLimitError(500)).toBe(false);
    });

    it('returns false for 400 status', () => {
      expect(isRateLimitError(400)).toBe(false);
    });

    it('returns false for 200 status', () => {
      expect(isRateLimitError(200)).toBe(false);
    });

    it('respects custom config', () => {
      const customConfig = {
        ...RATE_LIMIT_DEFAULT_CONFIG,
        retryStatusCodes: [429, 500],
      };
      expect(isRateLimitError(500, customConfig)).toBe(true);
      expect(isRateLimitError(503, customConfig)).toBe(false);
    });
  });

  describe('createRateLimitError', () => {
    it('creates error with correct properties', () => {
      const error = createRateLimitError(429, 'Rate limited', 5000);
      expect(error.status).toBe(429);
      expect(error.message).toBe('Rate limited');
      expect(error.retryAfter).toBe(5000);
      expect(error.isRateLimited).toBe(true);
    });

    it('sets isRateLimited false for non-429 status', () => {
      const error = createRateLimitError(503, 'Service unavailable');
      expect(error.isRateLimited).toBe(false);
    });
  });

  describe('getRateLimitMessage', () => {
    it('returns countdown message for 429 with retryAfter', () => {
      const error = createRateLimitError(429, '', 30000);
      expect(getRateLimitMessage(error)).toBe(
        'Rate limit exceeded. Please wait 30 seconds before trying again.'
      );
    });

    it('returns generic message for 429 without retryAfter', () => {
      const error = createRateLimitError(429, '');
      expect(getRateLimitMessage(error)).toBe(
        'Rate limit exceeded. Please wait a moment before trying again.'
      );
    });

    it('returns appropriate message for 503', () => {
      const error = createRateLimitError(503, '');
      expect(getRateLimitMessage(error)).toBe(
        'Service temporarily unavailable. Retrying...'
      );
    });

    it('returns appropriate message for 502', () => {
      const error = createRateLimitError(502, '');
      expect(getRateLimitMessage(error)).toBe(
        'Server temporarily unavailable. Retrying...'
      );
    });

    it('returns appropriate message for 504', () => {
      const error = createRateLimitError(504, '');
      expect(getRateLimitMessage(error)).toBe(
        'Server temporarily unavailable. Retrying...'
      );
    });

    it('returns original message for unknown status', () => {
      const error = createRateLimitError(500, 'Internal server error');
      expect(getRateLimitMessage(error)).toBe('Internal server error');
    });
  });

  describe('withRateLimitRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns data on successful first attempt', async () => {
      const fn = vi.fn().mockResolvedValue({ success: true });

      const resultPromise = withRateLimitRetry(fn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.data).toEqual({ success: true });
      expect(result.attempts).toBe(1);
      expect(result.totalDelayMs).toBe(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on 429 error and succeeds', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce({ status: 429, message: 'Rate limited' })
        .mockResolvedValue({ success: true });

      const resultPromise = withRateLimitRetry(fn, { baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.data).toEqual({ success: true });
      expect(result.attempts).toBe(2);
      expect(result.totalDelayMs).toBeGreaterThan(0);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('retries on 503 error and succeeds', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce({ status: 503, message: 'Service unavailable' })
        .mockResolvedValue({ success: true });

      const resultPromise = withRateLimitRetry(fn, { baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.data).toEqual({ success: true });
      expect(result.attempts).toBe(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not retry on non-retryable error', async () => {
      const fn = vi.fn().mockRejectedValue({ status: 400, message: 'Bad request' });

      const resultPromise = withRateLimitRetry(fn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(400);
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('stops after maxRetries', async () => {
      const fn = vi.fn().mockRejectedValue({ status: 429, message: 'Rate limited' });

      const resultPromise = withRateLimitRetry(fn, {
        maxRetries: 2,
        baseDelayMs: 100,
      });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(429);
      expect(result.attempts).toBe(3); // Initial + 2 retries
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('calls onRetry callback on each retry', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce({ status: 429, message: 'Rate limited' })
        .mockResolvedValue({ success: true });
      const onRetry = vi.fn();

      const resultPromise = withRateLimitRetry(fn, { baseDelayMs: 100 }, onRetry);
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        1,
        expect.any(Number),
        expect.objectContaining({ status: 429 })
      );
    });

    it('extracts status from error message', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('HTTP error! status: 429, message: rate limited'))
        .mockResolvedValue({ success: true });

      const resultPromise = withRateLimitRetry(fn, { baseDelayMs: 100 });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.data).toEqual({ success: true });
      expect(result.attempts).toBe(2);
    });

    it('respects custom retry status codes', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce({ status: 500, message: 'Server error' })
        .mockResolvedValue({ success: true });

      const resultPromise = withRateLimitRetry(fn, {
        retryStatusCodes: [429, 500],
        baseDelayMs: 100,
      });
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.data).toEqual({ success: true });
      expect(result.attempts).toBe(2);
    });
  });
});
