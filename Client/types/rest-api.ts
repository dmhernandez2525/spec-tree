/**
 * REST API types for F3.1.1 - Public API with key-based authentication
 */

/** Tier determines rate limits and access level */
export type ApiKeyTier = 'free' | 'starter' | 'pro' | 'enterprise';

/** Public API key for external access */
export interface PublicApiKey {
  id: string;
  name: string;
  prefix: string;
  tier: ApiKeyTier;
  isActive: boolean;
  corsOrigins: string[];
  rateLimit: number;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdById: string;
}

/** Rate limit configuration per tier */
export interface RateLimitConfig {
  tier: ApiKeyTier;
  requestsPerMinute: number;
  requestsPerDay: number;
  burstLimit: number;
}

/** Rate limit tier defaults */
export const RATE_LIMIT_DEFAULTS: Record<ApiKeyTier, RateLimitConfig> = {
  free: { tier: 'free', requestsPerMinute: 10, requestsPerDay: 100, burstLimit: 5 },
  starter: { tier: 'starter', requestsPerMinute: 30, requestsPerDay: 1000, burstLimit: 10 },
  pro: { tier: 'pro', requestsPerMinute: 60, requestsPerDay: 5000, burstLimit: 20 },
  enterprise: { tier: 'enterprise', requestsPerMinute: 120, requestsPerDay: 50000, burstLimit: 50 },
};

/** Headers included in rate-limited responses */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

/** API usage log entry */
export interface ApiUsageEntry {
  id: string;
  apiKeyId: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  requestSize: number;
  responseSize: number;
  userAgent: string | null;
  ipAddress: string;
  createdAt: string;
}

/** Aggregated API usage stats */
export interface ApiUsageStats {
  totalRequests: number;
  errorCount: number;
  avgLatencyMs: number;
  requestsByEndpoint: Record<string, number>;
  requestsByStatus: Record<string, number>;
  requestsByDay: Array<{ date: string; count: number }>;
}

/** Consistent API error response */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
  };
}

/** Consistent API success response (single resource) */
export interface ApiSingleResponse<T> {
  data: T;
  meta?: {
    apiVersion: string;
    requestId: string;
  };
}

/** Consistent API list response with pagination */
export interface ApiListResponse<T> {
  data: T[];
  meta: {
    apiVersion: string;
    requestId: string;
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/** Create API key request */
export interface CreateApiKeyRequest {
  name: string;
  tier?: ApiKeyTier;
  corsOrigins?: string[];
  expiresAt?: string | null;
}

/** API key creation response (only time raw key is returned) */
export interface CreateApiKeyResponse {
  key: string;
  data: PublicApiKey;
}

/** OpenAPI endpoint metadata */
export interface ApiEndpointMeta {
  method: string;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  parameters?: Array<{
    name: string;
    in: 'query' | 'path' | 'header';
    required: boolean;
    description: string;
    type: string;
  }>;
}

/** Redux state for REST API management */
export interface RestApiState {
  keys: PublicApiKey[];
  usage: ApiUsageStats | null;
  usageHistory: ApiUsageEntry[];
  isLoading: boolean;
  error: string | null;
}
