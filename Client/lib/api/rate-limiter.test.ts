import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, clearAllRateLimits } from './rate-limiter';

describe('rate-limiter', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('allows requests within the rate limit', () => {
    const result = checkRateLimit('key-1', 'free');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9); // free tier: 10 per minute, used 1
    expect(result.headers['X-RateLimit-Limit']).toBe('10');
  });

  it('blocks requests exceeding the rate limit', () => {
    // Exhaust the free tier limit (10 requests per minute)
    for (let i = 0; i < 10; i++) {
      checkRateLimit('key-2', 'free');
    }
    const result = checkRateLimit('key-2', 'free');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.headers['Retry-After']).toBeDefined();
  });

  it('uses different limits per tier', () => {
    const free = checkRateLimit('key-free', 'free');
    const pro = checkRateLimit('key-pro', 'pro');
    expect(free.headers['X-RateLimit-Limit']).toBe('10');
    expect(pro.headers['X-RateLimit-Limit']).toBe('60');
  });

  it('tracks limits per API key independently', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('key-a', 'free');
    }
    const resultA = checkRateLimit('key-a', 'free');
    const resultB = checkRateLimit('key-b', 'free');
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it('includes reset time in headers', () => {
    const result = checkRateLimit('key-3', 'free');
    const resetSeconds = parseInt(result.headers['X-RateLimit-Reset'], 10);
    expect(resetSeconds).toBeGreaterThan(0);
    expect(resetSeconds).toBeLessThanOrEqual(60);
  });

  it('clears all rate limits', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('key-4', 'free');
    }
    expect(checkRateLimit('key-4', 'free').allowed).toBe(false);
    clearAllRateLimits();
    expect(checkRateLimit('key-4', 'free').allowed).toBe(true);
  });
});
