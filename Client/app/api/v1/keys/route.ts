/**
 * GET /api/v1/keys - List API keys (authenticated via session cookie)
 * POST /api/v1/keys - Create a new API key (authenticated via session cookie)
 *
 * NOTE: This endpoint uses session cookie auth (internal), not API key auth (external).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = new Uint8Array(40);
  crypto.getRandomValues(randomBytes);
  let result = 'sk_live_';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  return result;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${STRAPI_URL}/api/public-api-keys?sort=createdAt:desc&pagination[pageSize]=100`,
      { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
    );

    if (!response.ok) {
      logger.error('v1-keys', 'Failed to fetch keys', { status: response.status });
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    const body = await response.json();
    const keys = (body.data || []).map((k: Record<string, unknown>) => ({
      id: k.documentId || k.id,
      name: k.name,
      prefix: k.prefix,
      tier: k.tier || 'free',
      isActive: k.isActive,
      corsOrigins: k.corsOrigins ? JSON.parse(k.corsOrigins as string) : [],
      rateLimit: k.rateLimit || 10,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt || null,
      expiresAt: k.expiresAt || null,
    }));

    return NextResponse.json({ data: keys });
  } catch (error) {
    logger.error('v1-keys', 'Fetch keys error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = body.name;
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Field "name" is required' }, { status: 400 });
  }

  const tier = typeof body.tier === 'string' && ['free', 'starter', 'pro', 'enterprise'].includes(body.tier)
    ? body.tier : 'free';
  const corsOrigins = Array.isArray(body.corsOrigins) ? body.corsOrigins : [];

  const rawKey = generateApiKey();
  const prefix = rawKey.slice(0, 8);
  const keyHash = await hashKey(rawKey);

  try {
    const payload = {
      data: {
        name,
        prefix,
        keyHash,
        tier,
        isActive: true,
        corsOrigins: JSON.stringify(corsOrigins),
        rateLimit: 10,
        expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : null,
      },
    };

    const response = await fetch(`${STRAPI_URL}/api/public-api-keys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error('v1-keys', 'Failed to create key', { status: response.status });
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }

    const created = await response.json();
    return NextResponse.json({
      key: rawKey,
      data: {
        id: created.data.documentId || created.data.id,
        name: created.data.name,
        prefix: created.data.prefix,
        tier: created.data.tier,
        isActive: true,
        createdAt: created.data.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('v1-keys', 'Create key error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
