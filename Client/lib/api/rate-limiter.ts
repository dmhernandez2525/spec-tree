/**
 * Server-side rate limiter for the public REST API.
 * Uses an in-memory sliding window counter per API key.
 */

import type { RateLimitHeaders, ApiKeyTier } from '@/types/rest-api';
import { RATE_LIMIT_DEFAULTS } from '@/types/rest-api';

interface WindowEntry {
  count: number;
  resetAt: number;
}

/** In-memory store keyed by `apiKeyId:window` */
const windows = new Map<string, WindowEntry>();

/** Cleanup interval (every 5 minutes) */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  windows.forEach((entry, key) => {
    if (entry.resetAt < now) {
      windows.delete(key);
    }
  });
}

export interface RateLimitResult {
  allowed: boolean;
  headers: RateLimitHeaders;
  remaining: number;
  limit: number;
  resetAt: number;
}

/**
 * Check rate limit for a given API key.
 * Returns whether the request is allowed and the appropriate headers.
 */
export function checkRateLimit(
  apiKeyId: string,
  tier: ApiKeyTier
): RateLimitResult {
  cleanup();

  const config = RATE_LIMIT_DEFAULTS[tier];
  const windowKey = `${apiKeyId}:minute`;
  const now = Date.now();
  const windowMs = 60_000;

  let entry = windows.get(windowKey);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    windows.set(windowKey, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, config.requestsPerMinute - entry.count);
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

  const headers: RateLimitHeaders = {
    'X-RateLimit-Limit': String(config.requestsPerMinute),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetSeconds),
  };

  if (entry.count > config.requestsPerMinute) {
    headers['Retry-After'] = String(resetSeconds);
    return { allowed: false, headers, remaining: 0, limit: config.requestsPerMinute, resetAt: entry.resetAt };
  }

  return { allowed: true, headers, remaining, limit: config.requestsPerMinute, resetAt: entry.resetAt };
}

/**
 * Reset the rate limit window for a specific key (useful for testing).
 */
export function resetRateLimit(apiKeyId: string): void {
  Array.from(windows.keys()).forEach((key) => {
    if (key.startsWith(apiKeyId)) {
      windows.delete(key);
    }
  });
}

/**
 * Clear all rate limit windows (useful for testing).
 */
export function clearAllRateLimits(): void {
  windows.clear();
}
