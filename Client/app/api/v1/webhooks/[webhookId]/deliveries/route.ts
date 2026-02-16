/**
 * GET /api/v1/webhooks/:webhookId/deliveries - List delivery attempts for a webhook
 *
 * Returns recent delivery records sorted by createdAt descending.
 * Supports standard pagination via page and pageSize query parameters.
 */

import { NextRequest } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiList, errors, parsePagination } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

/** Map a Strapi webhook delivery record to the public shape */
function mapDelivery(item: Record<string, unknown>): Record<string, unknown> {
  let payload: Record<string, unknown> = {};
  if (typeof item.payload === 'string') {
    try {
      payload = JSON.parse(item.payload) as Record<string, unknown>;
    } catch { /* use empty */ }
  } else if (typeof item.payload === 'object' && item.payload !== null) {
    payload = item.payload as Record<string, unknown>;
  }

  return {
    id: item.documentId || item.id,
    webhookId: item.webhookId || '',
    event: item.event || '',
    payload,
    statusCode: item.statusCode ?? null,
    responseBody: item.responseBody ?? null,
    latencyMs: item.latencyMs || 0,
    attemptNumber: item.attemptNumber || 1,
    maxAttempts: item.maxAttempts || 5,
    nextRetryAt: item.nextRetryAt || null,
    createdAt: item.createdAt,
    success: item.success ?? false,
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function handleGet(
  request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { webhookId } = params;

  // First verify the webhook exists and belongs to this organization
  const webhookResponse = await fetch(`${STRAPI_URL}/api/webhooks/${webhookId}`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!webhookResponse.ok) {
    if (webhookResponse.status === 404) return errors.notFound('Webhook');
    logger.error('v1-webhooks-deliveries', 'Strapi webhook fetch failed', {
      status: webhookResponse.status,
    });
    return errors.internal('Failed to verify webhook');
  }

  const webhookBody = await webhookResponse.json();
  const webhook = webhookBody.data as Record<string, unknown> | undefined;
  if (!webhook) {
    return errors.notFound('Webhook');
  }

  // Verify ownership
  if (ctx.key.organizationId && webhook.organizationId !== ctx.key.organizationId) {
    return errors.notFound('Webhook');
  }

  // Fetch deliveries for this webhook
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePagination(searchParams);

  const deliveriesUrl =
    `${STRAPI_URL}/api/webhook-deliveries` +
    `?filters[webhookId][$eq]=${encodeURIComponent(webhookId)}` +
    `&pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}` +
    `&sort=createdAt:desc`;

  const deliveriesResponse = await fetch(deliveriesUrl, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!deliveriesResponse.ok) {
    logger.error('v1-webhooks-deliveries', 'Strapi deliveries fetch failed', {
      status: deliveriesResponse.status,
      webhookId,
    });
    return errors.internal('Failed to fetch deliveries');
  }

  const deliveriesBody = await deliveriesResponse.json();
  const deliveries = (deliveriesBody.data || []).map(
    (item: Record<string, unknown>) => mapDelivery(item),
  );
  const pagination = deliveriesBody.meta?.pagination || {
    page,
    pageSize,
    pageCount: 1,
    total: deliveries.length,
  };

  return apiList(deliveries, pagination, { corsOrigin: ctx.corsOrigin });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withApiMiddleware(async (req, ctx, params) => handleGet(req, ctx, params));
