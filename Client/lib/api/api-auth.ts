/**
 * API key authentication for public REST API (v1)
 * Validates API keys from the Authorization header and returns key metadata.
 */

import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import type { ApiKeyTier } from '@/types/rest-api';

export interface AuthenticatedKey {
  id: string;
  name: string;
  tier: ApiKeyTier;
  corsOrigins: string[];
  rateLimit: number;
  organizationId: string;
}

interface StrapiApiKeyRecord {
  id: number;
  documentId: string;
  name: string;
  keyHash: string;
  prefix: string;
  tier: string;
  isActive: boolean;
  corsOrigins: string | null;
  rateLimit: number;
  expiresAt: string | null;
  organization?: { id: number; documentId: string };
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

/**
 * Hash an API key using the Web Crypto API (SHA-256)
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract API key from the Authorization header.
 * Supports: "Bearer sk_..." and "sk_..." formats.
 */
function extractApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return authHeader.trim();
}

/**
 * Parse CORS origins from a JSON string or comma-separated list.
 */
function parseCorsOrigins(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    // Fall back to comma-separated
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Authenticate a request using an API key.
 * Returns the authenticated key metadata or null if invalid.
 */
export async function authenticateApiKey(request: NextRequest): Promise<AuthenticatedKey | null> {
  const rawKey = extractApiKey(request);
  if (!rawKey) return null;

  const prefix = rawKey.slice(0, 8);
  const keyHash = await hashApiKey(rawKey);

  try {
    const url =
      `${STRAPI_URL}/api/public-api-keys` +
      `?filters[prefix][$eq]=${encodeURIComponent(prefix)}` +
      `&filters[isActive][$eq]=true` +
      `&populate=organization`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    });

    if (!response.ok) {
      logger.error('api-auth', 'Strapi lookup failed', { status: response.status });
      return null;
    }

    const body = await response.json() as { data: StrapiApiKeyRecord[] };
    const match = body.data?.find((k) => k.keyHash === keyHash);

    if (!match) return null;

    if (match.expiresAt && new Date(match.expiresAt) < new Date()) {
      logger.warn('api-auth', 'API key expired', { prefix });
      return null;
    }

    // Update lastUsedAt asynchronously (fire and forget)
    void fetch(`${STRAPI_URL}/api/public-api-keys/${match.documentId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { lastUsedAt: new Date().toISOString() } }),
    }).catch(() => { /* best effort */ });

    const tier = (['free', 'starter', 'pro', 'enterprise'].includes(match.tier)
      ? match.tier
      : 'free') as ApiKeyTier;

    return {
      id: match.documentId,
      name: match.name,
      tier,
      corsOrigins: parseCorsOrigins(match.corsOrigins),
      rateLimit: match.rateLimit || 10,
      organizationId: match.organization?.documentId || '',
    };
  } catch (error) {
    logger.error('api-auth', 'Authentication failed', { error });
    return null;
  }
}

/**
 * Validate CORS origin against allowed origins for this API key.
 */
export function validateCorsOrigin(origin: string | null, allowed: string[]): boolean {
  if (allowed.length === 0) return true; // No restrictions
  if (!origin) return false;
  return allowed.some((pattern) => {
    if (pattern === '*') return true;
    if (pattern === origin) return true;
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(1);
      return origin.endsWith(suffix);
    }
    return false;
  });
}
