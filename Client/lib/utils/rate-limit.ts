import { logger } from '@/lib/logger';

export interface RateLimitConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryStatusCodes: number[];
}

export interface RateLimitError {
  status: number;
  retryAfter?: number;
  message: string;
  isRateLimited: boolean;
}

export interface RetryResult<T> {
  data?: T;
  error?: RateLimitError;
  attempts: number;
  totalDelayMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryStatusCodes: [429, 503, 502, 504],
};

/**
 * Calculate delay with exponential backoff and jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  retryAfterMs?: number
): number {
  // If server provides retry-after, use it (with a cap)
  if (retryAfterMs !== undefined) {
    return Math.min(retryAfterMs, maxDelayMs);
  }

  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);

  // Add jitter (±25% randomization to prevent thundering herd)
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);

  // Clamp to maxDelayMs
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Parse retry-after header from response
 */
export function parseRetryAfterHeader(
  headers: Headers | Record<string, string>
): number | undefined {
  let retryAfterValue: string | null | undefined;

  if (headers instanceof Headers) {
    retryAfterValue = headers.get('retry-after');
  } else {
    retryAfterValue = headers['retry-after'] || headers['Retry-After'];
  }

  if (!retryAfterValue) {
    return undefined;
  }

  // Try parsing as seconds first
  const seconds = parseInt(retryAfterValue, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Try parsing as HTTP date
  const date = new Date(retryAfterValue);
  if (!isNaN(date.getTime())) {
    const delayMs = date.getTime() - Date.now();
    return delayMs > 0 ? delayMs : undefined;
  }

  return undefined;
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(status: number, config: RateLimitConfig = DEFAULT_CONFIG): boolean {
  return config.retryStatusCodes.includes(status);
}

/**
 * Create a rate limit error object from response
 */
export function createRateLimitError(
  status: number,
  message: string,
  retryAfterMs?: number
): RateLimitError {
  return {
    status,
    retryAfter: retryAfterMs,
    message,
    isRateLimited: status === 429,
  };
}

/**
 * Get user-friendly message for rate limit errors
 */
export function getRateLimitMessage(error: RateLimitError): string {
  if (error.status === 429) {
    if (error.retryAfter) {
      const seconds = Math.ceil(error.retryAfter / 1000);
      return `Rate limit exceeded. Please wait ${seconds} seconds before trying again.`;
    }
    return 'Rate limit exceeded. Please wait a moment before trying again.';
  }

  if (error.status === 503) {
    return 'Service temporarily unavailable. Retrying...';
  }

  if (error.status === 502 || error.status === 504) {
    return 'Server temporarily unavailable. Retrying...';
  }

  return error.message || 'An unexpected error occurred.';
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with automatic retry on rate limit errors
 */
export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RateLimitConfig> = {},
  onRetry?: (attempt: number, delayMs: number, error: RateLimitError) => void
): Promise<RetryResult<T>> {
  const mergedConfig: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };
  let attempts = 0;
  let totalDelayMs = 0;

  while (attempts <= mergedConfig.maxRetries) {
    try {
      const data = await fn();
      return { data, attempts: attempts + 1, totalDelayMs };
    } catch (error) {
      attempts++;

      // Extract status code and headers from error
      const { status, retryAfterMs, message } = extractErrorInfo(error);

      if (!isRateLimitError(status, mergedConfig) || attempts > mergedConfig.maxRetries) {
        const rateLimitError = createRateLimitError(status, message, retryAfterMs);
        return { error: rateLimitError, attempts, totalDelayMs };
      }

      const rateLimitError = createRateLimitError(status, message, retryAfterMs);
      const delayMs = calculateBackoffDelay(
        attempts - 1,
        mergedConfig.baseDelayMs,
        mergedConfig.maxDelayMs,
        retryAfterMs
      );

      logger.log('RateLimit', `Retry attempt ${attempts}/${mergedConfig.maxRetries}`, {
        status,
        delayMs,
        retryAfterMs,
      });

      onRetry?.(attempts, delayMs, rateLimitError);

      await sleep(delayMs);
      totalDelayMs += delayMs;
    }
  }

  return {
    error: createRateLimitError(429, 'Max retries exceeded'),
    attempts,
    totalDelayMs,
  };
}

/**
 * Extract error information from various error types
 */
function extractErrorInfo(error: unknown): {
  status: number;
  retryAfterMs?: number;
  message: string;
} {
  if (error instanceof Response) {
    return {
      status: error.status,
      retryAfterMs: parseRetryAfterHeader(error.headers),
      message: error.statusText || 'Request failed',
    };
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;

    // Handle fetch-style errors
    if ('status' in errorObj && typeof errorObj.status === 'number') {
      return {
        status: errorObj.status,
        retryAfterMs:
          errorObj.headers instanceof Headers
            ? parseRetryAfterHeader(errorObj.headers)
            : undefined,
        message: (errorObj.message as string) || 'Request failed',
      };
    }

    // Handle wrapped errors with response property
    if ('response' in errorObj && errorObj.response && typeof errorObj.response === 'object') {
      const response = errorObj.response as Record<string, unknown>;
      return {
        status: (response.status as number) || 0,
        message: (errorObj.message as string) || 'Request failed',
      };
    }

    // Handle error with statusCode property
    if ('statusCode' in errorObj && typeof errorObj.statusCode === 'number') {
      return {
        status: errorObj.statusCode,
        message: (errorObj.message as string) || 'Request failed',
      };
    }

    // Handle error message containing status code
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      const statusMatch = errorObj.message.match(/status:\s*(\d+)/i);
      if (statusMatch) {
        return {
          status: parseInt(statusMatch[1], 10),
          message: errorObj.message,
        };
      }
    }
  }

  if (error instanceof Error) {
    // Try to extract status from error message
    const statusMatch = error.message.match(/status:\s*(\d+)/i);
    if (statusMatch) {
      return {
        status: parseInt(statusMatch[1], 10),
        message: error.message,
      };
    }
    return { status: 0, message: error.message };
  }

  return { status: 0, message: String(error) };
}

export { DEFAULT_CONFIG as RATE_LIMIT_DEFAULT_CONFIG };
