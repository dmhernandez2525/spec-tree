/**
 * Client-side Rate Limiting
 *
 * Provides request throttling on the client to prevent excessive API calls,
 * complementing server-side rate limiting. This reduces unnecessary network
 * traffic and improves the user experience during high-activity periods.
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Backoff duration in milliseconds when the limit is exceeded */
  backoffMs: number;
}

export interface RateLimitState {
  /** Number of requests made in the current window */
  requestCount: number;
  /** Timestamp (ms) when the current window started */
  windowStart: number;
  /** Whether the client is currently throttled */
  isThrottled: boolean;
  /** Timestamp (ms) when the next request will be allowed, or null if not throttled */
  retryAfter: number | null;
}

export interface ClientRateLimiter {
  /** Check if a request can be made without exceeding the limit */
  canMakeRequest: () => boolean;
  /** Record a request and return the updated state */
  recordRequest: () => RateLimitState;
  /** Get the current rate limit state */
  getState: () => RateLimitState;
  /** Reset all counters and state */
  reset: () => void;
  /** Get milliseconds until the next request is allowed (0 if not throttled) */
  getRetryAfterMs: () => number;
}

/**
 * Create a client-side rate limiter with the given configuration.
 * The limiter uses a sliding window approach; when the window expires,
 * counters reset automatically on the next check.
 */
export function createClientRateLimiter(config: RateLimitConfig): ClientRateLimiter {
  let requestCount = 0;
  let windowStart = Date.now();
  let throttledUntil: number | null = null;

  function resetWindowIfExpired(): void {
    const now = Date.now();
    if (now - windowStart >= config.windowMs) {
      requestCount = 0;
      windowStart = now;
      throttledUntil = null;
    }
  }

  function canMakeRequest(): boolean {
    resetWindowIfExpired();

    const now = Date.now();
    if (throttledUntil !== null && now < throttledUntil) {
      return false;
    }

    // Backoff period has expired; start a fresh window
    if (throttledUntil !== null && now >= throttledUntil) {
      throttledUntil = null;
      requestCount = 0;
      windowStart = now;
    }

    return requestCount < config.maxRequests;
  }

  function recordRequest(): RateLimitState {
    resetWindowIfExpired();

    requestCount++;

    if (requestCount >= config.maxRequests) {
      throttledUntil = Date.now() + config.backoffMs;
    }

    return getState();
  }

  function getState(): RateLimitState {
    resetWindowIfExpired();

    const now = Date.now();
    const isThrottled = throttledUntil !== null && now < throttledUntil;

    return {
      requestCount,
      windowStart,
      isThrottled,
      retryAfter: isThrottled ? throttledUntil : null,
    };
  }

  function reset(): void {
    requestCount = 0;
    windowStart = Date.now();
    throttledUntil = null;
  }

  function getRetryAfterMs(): number {
    resetWindowIfExpired();

    const now = Date.now();
    if (throttledUntil !== null && now < throttledUntil) {
      return throttledUntil - now;
    }

    return 0;
  }

  return {
    canMakeRequest,
    recordRequest,
    getState,
    reset,
    getRetryAfterMs,
  };
}

/**
 * Default rate limit configurations for different request categories.
 */
export const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  /** General API requests: 60 per minute */
  api: {
    maxRequests: 60,
    windowMs: 60_000,
    backoffMs: 5_000,
  },
  /** AI/LLM requests: 10 per minute */
  ai: {
    maxRequests: 10,
    windowMs: 60_000,
    backoffMs: 10_000,
  },
  /** Export operations: 5 per minute */
  export: {
    maxRequests: 5,
    windowMs: 60_000,
    backoffMs: 15_000,
  },
};
