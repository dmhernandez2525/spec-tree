/**
 * Shared middleware for v1 API routes.
 * Handles authentication, rate limiting, CORS, and logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey, validateCorsOrigin, type AuthenticatedKey } from './api-auth';
import { checkRateLimit } from './rate-limiter';
import { errors } from './api-response';
import { logApiRequest } from './api-logger';

export interface ApiContext {
  key: AuthenticatedKey;
  corsOrigin: string | undefined;
  startTime: number;
}

type ApiHandler = (
  request: NextRequest,
  context: ApiContext,
  params: Record<string, string>
) => Promise<NextResponse>;

/**
 * Wrap a v1 API route handler with authentication, rate limiting, CORS, and logging.
 */
export function withApiMiddleware(handler: ApiHandler) {
  return async (request: NextRequest, routeContext: { params: Promise<Record<string, string>> }): Promise<NextResponse> => {
    const startTime = Date.now();
    const resolvedParams = await routeContext.params;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      response.headers.set('Access-Control-Max-Age', '86400');
      const origin = request.headers.get('origin');
      if (origin) response.headers.set('Access-Control-Allow-Origin', origin);
      return response;
    }

    // Authenticate
    const key = await authenticateApiKey(request);
    if (!key) {
      const response = errors.unauthorized();
      logApiRequest(request, 401, startTime, null);
      return response;
    }

    // CORS origin check
    const origin = request.headers.get('origin') || undefined;
    if (origin && !validateCorsOrigin(origin, key.corsOrigins)) {
      const response = errors.corsRejected();
      logApiRequest(request, 403, startTime, key.id);
      return response;
    }

    // Rate limiting
    const rateResult = checkRateLimit(key.id, key.tier);
    if (!rateResult.allowed) {
      const response = errors.rateLimited(
        rateResult.headers['Retry-After'] || '60',
        rateResult.headers
      );
      logApiRequest(request, 429, startTime, key.id);
      return response;
    }

    // Execute handler
    const ctx: ApiContext = { key, corsOrigin: origin, startTime };
    try {
      const response = await handler(request, ctx, resolvedParams);
      logApiRequest(request, response.status, startTime, key.id);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      const response = errors.internal(message, rateResult.headers);
      logApiRequest(request, 500, startTime, key.id);
      return response;
    }
  };
}
