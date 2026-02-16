/**
 * Consistent response builders for the public REST API (v1).
 * All API responses follow a uniform structure.
 */

import { NextResponse } from 'next/server';
import type { RateLimitHeaders } from '@/types/rest-api';

const API_VERSION = 'v1';

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Attach rate limit headers and CORS headers to a response.
 */
function withHeaders(
  response: NextResponse,
  rateLimitHeaders?: RateLimitHeaders,
  corsOrigin?: string
): NextResponse {
  response.headers.set('X-API-Version', API_VERSION);
  response.headers.set('X-Request-Id', generateRequestId());

  if (rateLimitHeaders) {
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }
  }

  if (corsOrigin) {
    response.headers.set('Access-Control-Allow-Origin', corsOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

/**
 * Success response with a single resource.
 */
export function apiSuccess<T>(
  data: T,
  options?: { status?: number; rateLimitHeaders?: RateLimitHeaders; corsOrigin?: string }
): NextResponse {
  const status = options?.status || 200;
  const body = {
    data,
    meta: { apiVersion: API_VERSION, requestId: generateRequestId() },
  };
  const response = NextResponse.json(body, { status });
  return withHeaders(response, options?.rateLimitHeaders, options?.corsOrigin);
}

/**
 * Success response with a paginated list.
 */
export function apiList<T>(
  data: T[],
  pagination: { page: number; pageSize: number; pageCount: number; total: number },
  options?: { rateLimitHeaders?: RateLimitHeaders; corsOrigin?: string }
): NextResponse {
  const body = {
    data,
    meta: {
      apiVersion: API_VERSION,
      requestId: generateRequestId(),
      pagination,
    },
  };
  const response = NextResponse.json(body, { status: 200 });
  return withHeaders(response, options?.rateLimitHeaders, options?.corsOrigin);
}

/**
 * Error response with consistent structure.
 */
export function apiError(
  code: string,
  message: string,
  status: number,
  options?: { details?: Record<string, unknown>; rateLimitHeaders?: RateLimitHeaders; corsOrigin?: string }
): NextResponse {
  const body = {
    error: { code, message, status, ...(options?.details ? { details: options.details } : {}) },
  };
  const response = NextResponse.json(body, { status });
  return withHeaders(response, options?.rateLimitHeaders, options?.corsOrigin);
}

/** Common error shortcuts */
export const errors = {
  unauthorized: (msg = 'Invalid or missing API key', rl?: RateLimitHeaders) =>
    apiError('UNAUTHORIZED', msg, 401, { rateLimitHeaders: rl }),
  forbidden: (msg = 'Insufficient permissions', rl?: RateLimitHeaders) =>
    apiError('FORBIDDEN', msg, 403, { rateLimitHeaders: rl }),
  notFound: (resource = 'Resource', rl?: RateLimitHeaders) =>
    apiError('NOT_FOUND', `${resource} not found`, 404, { rateLimitHeaders: rl }),
  badRequest: (msg: string, rl?: RateLimitHeaders) =>
    apiError('BAD_REQUEST', msg, 400, { rateLimitHeaders: rl }),
  rateLimited: (retryAfter: string, rl?: RateLimitHeaders) =>
    apiError('RATE_LIMITED', 'Rate limit exceeded', 429, { rateLimitHeaders: rl, details: { retryAfter } }),
  corsRejected: () =>
    apiError('CORS_REJECTED', 'Origin not allowed', 403),
  internal: (msg = 'Internal server error', rl?: RateLimitHeaders) =>
    apiError('INTERNAL_ERROR', msg, 500, { rateLimitHeaders: rl }),
};

/**
 * Parse standard pagination query params.
 */
export function parsePagination(searchParams: URLSearchParams): { page: number; pageSize: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '25', 10) || 25));
  return { page, pageSize };
}

/**
 * Parse sorting query params. Format: "field:asc" or "field:desc".
 */
export function parseSort(searchParams: URLSearchParams, allowedFields: string[]): string | null {
  const raw = searchParams.get('sort');
  if (!raw) return null;
  const [field, dir] = raw.split(':');
  if (!field || !allowedFields.includes(field)) return null;
  const direction = dir === 'desc' ? 'desc' : 'asc';
  return `${field}:${direction}`;
}
