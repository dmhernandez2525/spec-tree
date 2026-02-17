/**
 * GET  /api/v1/webhooks - List webhook subscriptions for the authenticated organization
 * POST /api/v1/webhooks - Create a new webhook subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, apiList, errors, parsePagination } from '@/lib/api/api-response';
import { generateWebhookSecret } from '@/lib/webhooks/webhook-signer';
import { logger } from '@/lib/logger';
import type { WebhookEvent } from '@/types/webhook';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

/** All valid webhook event names */
const VALID_EVENTS: WebhookEvent[] = [
  'spec.created',
  'spec.updated',
  'spec.deleted',
  'spec.exported',
  'epic.created',
  'epic.updated',
  'epic.deleted',
  'feature.created',
  'feature.updated',
  'feature.deleted',
  'generation.completed',
];

/**
 * Hash a webhook secret using SHA-256 for storage.
 * The plaintext secret is only returned once at creation time.
 */
async function hashSecret(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Validate that a string is a well-formed URL */
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Map a Strapi webhook record to the public WebhookConfig shape */
function mapWebhook(item: Record<string, unknown>): Record<string, unknown> {
  return {
    id: item.documentId || item.id,
    name: item.name || '',
    url: item.url || '',
    events: parseJsonArray(item.events),
    status: item.status || 'active',
    customHeaders: parseJsonObject(item.customHeaders),
    payloadFields: parseJsonArray(item.payloadFields),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    failureCount: item.failureCount || 0,
    lastDeliveryAt: item.lastDeliveryAt || null,
    lastDeliveryStatus: item.lastDeliveryStatus || null,
  };
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* fall through */ }
  }
  return [];
}

function parseJsonObject(value: unknown): Record<string, string> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, string>;
  }
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    } catch { /* fall through */ }
  }
  return {};
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest, ctx: ApiContext) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePagination(searchParams);

  const orgFilter = ctx.key.organizationId
    ? `&filters[organizationId][$eq]=${encodeURIComponent(ctx.key.organizationId)}`
    : '';

  const url =
    `${STRAPI_URL}/api/webhooks` +
    `?pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}` +
    `&sort=createdAt:desc` +
    orgFilter;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    logger.error('v1-webhooks', 'Strapi fetch failed', { status: response.status });
    return errors.internal('Failed to fetch webhooks');
  }

  const body = await response.json();
  const webhooks = (body.data || []).map((item: Record<string, unknown>) => mapWebhook(item));
  const pagination = body.meta?.pagination || { page, pageSize, pageCount: 1, total: webhooks.length };

  return apiList(webhooks, pagination, { corsOrigin: ctx.corsOrigin });
}

async function handlePost(request: NextRequest, ctx: ApiContext) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  // Validate name
  const name = body.name;
  if (!name || typeof name !== 'string') {
    return errors.badRequest('Field "name" is required and must be a string');
  }

  // Validate url
  const url = body.url;
  if (!url || typeof url !== 'string') {
    return errors.badRequest('Field "url" is required and must be a string');
  }
  if (!isValidUrl(url)) {
    return errors.badRequest('Field "url" must be a valid HTTP or HTTPS URL');
  }

  // Validate events
  const events = body.events;
  if (!Array.isArray(events) || events.length === 0) {
    return errors.badRequest('Field "events" is required and must be a non-empty array');
  }
  const invalidEvents = events.filter((e) => !VALID_EVENTS.includes(e as WebhookEvent));
  if (invalidEvents.length > 0) {
    return errors.badRequest(`Invalid event types: ${invalidEvents.join(', ')}`);
  }

  // Optional fields
  const customHeaders = typeof body.customHeaders === 'object' && body.customHeaders !== null
    ? body.customHeaders as Record<string, string>
    : {};
  const payloadFields = Array.isArray(body.payloadFields) ? body.payloadFields as string[] : [];

  // Generate and hash the signing secret
  const rawSecret = generateWebhookSecret();
  const secretHash = await hashSecret(rawSecret);

  const payload = {
    data: {
      name,
      url,
      events: JSON.stringify(events),
      secretHash,
      status: 'active',
      customHeaders: JSON.stringify(customHeaders),
      payloadFields: JSON.stringify(payloadFields),
      failureCount: 0,
      organizationId: ctx.key.organizationId || null,
    },
  };

  const strapiResponse = await fetch(`${STRAPI_URL}/api/webhooks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!strapiResponse.ok) {
    logger.error('v1-webhooks', 'Strapi create failed', { status: strapiResponse.status });
    return errors.internal('Failed to create webhook');
  }

  const created = await strapiResponse.json();
  const webhook = mapWebhook(created.data);

  return apiSuccess(
    { secret: rawSecret, data: webhook },
    { status: 201, corsOrigin: ctx.corsOrigin },
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withApiMiddleware(async (request, ctx) => handleGet(request, ctx));
export const POST = withApiMiddleware(async (request, ctx) => handlePost(request, ctx));
export const OPTIONS = withApiMiddleware(async () => {
  return new NextResponse(null, { status: 204 });
});
