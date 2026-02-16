/**
 * Request/response logging for the public REST API.
 * Redacts sensitive fields (API keys, tokens, passwords).
 */

import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

const SENSITIVE_KEYS = new Set([
  'authorization',
  'apikey',
  'api_key',
  'token',
  'password',
  'secret',
  'encryptedkey',
  'keyhash',
]);

/**
 * Redact sensitive fields from an object (shallow).
 */
function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Redact headers for logging.
 */
function redactHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value;
    }
  });
  return result;
}

export interface ApiLogEntry {
  method: string;
  path: string;
  apiKeyId: string | null;
  statusCode: number;
  latencyMs: number;
  userAgent: string | null;
  ip: string;
  requestHeaders: Record<string, string>;
}

/**
 * Log an API request/response pair.
 */
export function logApiRequest(
  request: NextRequest,
  statusCode: number,
  startTime: number,
  apiKeyId: string | null
): void {
  const latencyMs = Date.now() - startTime;
  const entry: ApiLogEntry = {
    method: request.method,
    path: new URL(request.url).pathname,
    apiKeyId,
    statusCode,
    latencyMs,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    requestHeaders: redactHeaders(request.headers),
  };

  if (statusCode >= 500) {
    logger.error('api-v1', `${entry.method} ${entry.path} ${statusCode} ${latencyMs}ms`, entry);
  } else if (statusCode >= 400) {
    logger.warn('api-v1', `${entry.method} ${entry.path} ${statusCode} ${latencyMs}ms`, entry);
  } else {
    logger.info('api-v1', `${entry.method} ${entry.path} ${statusCode} ${latencyMs}ms`, entry);
  }
}

export { redactObject };
