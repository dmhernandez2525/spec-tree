/**
 * GET    /api/v1/webhooks/:webhookId - Get a single webhook by ID
 * PATCH  /api/v1/webhooks/:webhookId - Update a webhook
 * DELETE /api/v1/webhooks/:webhookId - Delete a webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';
import type { WebhookEvent, WebhookStatus } from '@/types/webhook';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

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

const VALID_STATUSES: WebhookStatus[] = ['active', 'paused', 'disabled'];

/** Validate that a string is a well-formed URL */
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a webhook from Strapi and verify it belongs to the requesting
 * organization. Returns the raw Strapi record or null.
 */
async function fetchAndVerifyOwnership(
  webhookId: string,
  organizationId: string,
): Promise<Record<string, unknown> | null> {
  const response = await fetch(`${STRAPI_URL}/api/webhooks/${webhookId}`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) return null;

  const body = await response.json();
  const item = body.data as Record<string, unknown> | undefined;
  if (!item) return null;

  // Verify ownership via organization
  if (organizationId && item.organizationId !== organizationId) {
    return null;
  }

  return item;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleGet(
  _request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { webhookId } = params;
  const item = await fetchAndVerifyOwnership(webhookId, ctx.key.organizationId);

  if (!item) {
    return errors.notFound('Webhook');
  }

  return apiSuccess(mapWebhook(item), { corsOrigin: ctx.corsOrigin });
}

async function handlePatch(
  request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { webhookId } = params;
  const existing = await fetchAndVerifyOwnership(webhookId, ctx.key.organizationId);

  if (!existing) {
    return errors.notFound('Webhook');
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  const data: Record<string, unknown> = {};

  if (typeof body.name === 'string') {
    data.name = body.name;
  }

  if (typeof body.url === 'string') {
    if (!isValidUrl(body.url)) {
      return errors.badRequest('Field "url" must be a valid HTTP or HTTPS URL');
    }
    data.url = body.url;
  }

  if (Array.isArray(body.events)) {
    if (body.events.length === 0) {
      return errors.badRequest('Field "events" must be a non-empty array');
    }
    const invalidEvents = body.events.filter(
      (e) => !VALID_EVENTS.includes(e as WebhookEvent),
    );
    if (invalidEvents.length > 0) {
      return errors.badRequest(`Invalid event types: ${invalidEvents.join(', ')}`);
    }
    data.events = JSON.stringify(body.events);
  }

  if (typeof body.status === 'string') {
    if (!VALID_STATUSES.includes(body.status as WebhookStatus)) {
      return errors.badRequest(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    data.status = body.status;
  }

  if (typeof body.customHeaders === 'object' && body.customHeaders !== null) {
    data.customHeaders = JSON.stringify(body.customHeaders);
  }

  if (Array.isArray(body.payloadFields)) {
    data.payloadFields = JSON.stringify(body.payloadFields);
  }

  if (Object.keys(data).length === 0) {
    return errors.badRequest('No valid fields to update');
  }

  const response = await fetch(`${STRAPI_URL}/api/webhooks/${webhookId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Webhook');
    logger.error('v1-webhooks', 'Strapi update failed', {
      status: response.status,
      webhookId,
    });
    return errors.internal('Failed to update webhook');
  }

  const updated = await response.json();
  return apiSuccess(mapWebhook(updated.data), { corsOrigin: ctx.corsOrigin });
}

async function handleDelete(
  _request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { webhookId } = params;
  const existing = await fetchAndVerifyOwnership(webhookId, ctx.key.organizationId);

  if (!existing) {
    return errors.notFound('Webhook');
  }

  const response = await fetch(`${STRAPI_URL}/api/webhooks/${webhookId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Webhook');
    logger.error('v1-webhooks', 'Strapi delete failed', {
      status: response.status,
      webhookId,
    });
    return errors.internal('Failed to delete webhook');
  }

  const deleteResponse = new NextResponse(null, { status: 204 });
  if (ctx.corsOrigin) {
    deleteResponse.headers.set('Access-Control-Allow-Origin', ctx.corsOrigin);
  }
  return deleteResponse;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withApiMiddleware(async (req, ctx, params) => handleGet(req, ctx, params));
export const PATCH = withApiMiddleware(async (req, ctx, params) => handlePatch(req, ctx, params));
export const DELETE = withApiMiddleware(async (req, ctx, params) => handleDelete(req, ctx, params));
