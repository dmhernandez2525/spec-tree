/**
 * POST /api/v1/webhooks/:webhookId/test - Send a test delivery to a webhook
 *
 * Creates a sample event payload and delivers it to the webhook's URL
 * using the configured signing secret. Returns the delivery result
 * including status code, latency, and success flag.
 */

import { NextRequest } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { signPayload, SIGNATURE_HEADER, TIMESTAMP_HEADER } from '@/lib/webhooks/webhook-signer';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

/**
 * Build a sample test event payload that mirrors the shape of a real delivery.
 */
function buildTestPayload(): Record<string, unknown> {
  return {
    event: 'spec.updated',
    timestamp: new Date().toISOString(),
    test: true,
    data: {
      id: 'test_spec_001',
      name: 'Sample Specification',
      updatedAt: new Date().toISOString(),
      updatedBy: 'webhook-test',
    },
  };
}

async function handlePost(
  _request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { webhookId } = params;

  // Fetch the webhook from Strapi
  const fetchResponse = await fetch(`${STRAPI_URL}/api/webhooks/${webhookId}`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!fetchResponse.ok) {
    if (fetchResponse.status === 404) return errors.notFound('Webhook');
    logger.error('v1-webhooks-test', 'Strapi fetch failed', { status: fetchResponse.status });
    return errors.internal('Failed to fetch webhook');
  }

  const fetchBody = await fetchResponse.json();
  const webhook = fetchBody.data as Record<string, unknown> | undefined;
  if (!webhook) {
    return errors.notFound('Webhook');
  }

  // Verify ownership
  if (ctx.key.organizationId && webhook.organizationId !== ctx.key.organizationId) {
    return errors.notFound('Webhook');
  }

  const webhookUrl = webhook.url as string;
  const secretHash = webhook.secretHash as string;
  const customHeadersRaw = webhook.customHeaders;

  // Parse custom headers
  let customHeaders: Record<string, string> = {};
  if (typeof customHeadersRaw === 'string') {
    try {
      customHeaders = JSON.parse(customHeadersRaw) as Record<string, string>;
    } catch { /* use empty */ }
  } else if (typeof customHeadersRaw === 'object' && customHeadersRaw !== null) {
    customHeaders = customHeadersRaw as Record<string, string>;
  }

  // Build and sign the test payload
  const payload = buildTestPayload();
  const bodyString = JSON.stringify(payload);
  const timestamp = Date.now().toString();

  // Sign with the stored hash as the secret (consistent with delivery engine)
  const signature = await signPayload(bodyString, secretHash);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [SIGNATURE_HEADER]: signature,
    [TIMESTAMP_HEADER]: timestamp,
    'X-Webhook-Event': 'spec.updated',
    'X-Webhook-ID': `whk_test_${Date.now().toString(36)}`,
    ...customHeaders,
  };

  // Deliver the test payload
  const start = performance.now();
  let statusCode: number | null = null;
  let responseBody: string | null = null;
  let success = false;

  try {
    const deliveryResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: bodyString,
      signal: AbortSignal.timeout(30_000),
    });

    statusCode = deliveryResponse.status;
    responseBody = await deliveryResponse.text().catch(() => null);
    success = deliveryResponse.ok;
  } catch (error) {
    logger.error('v1-webhooks-test', 'Test delivery failed', {
      webhookId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  const latencyMs = Math.round(performance.now() - start);

  // Store the test delivery record in Strapi
  const deliveryRecord = {
    data: {
      webhookId: (webhook.documentId || webhook.id) as string,
      event: 'spec.updated',
      payload: JSON.stringify(payload),
      statusCode,
      responseBody: responseBody ? responseBody.slice(0, 1000) : null,
      latencyMs,
      attemptNumber: 1,
      maxAttempts: 1,
      success,
      isTest: true,
      createdAt: new Date().toISOString(),
    },
  };

  void fetch(`${STRAPI_URL}/api/webhook-deliveries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deliveryRecord),
  }).catch((err) => {
    logger.warn('v1-webhooks-test', 'Failed to store test delivery record', { err });
  });

  const result = {
    webhookId: (webhook.documentId || webhook.id) as string,
    event: 'spec.updated',
    statusCode,
    latencyMs,
    success,
    responseBody: responseBody ? responseBody.slice(0, 500) : null,
    deliveredAt: new Date().toISOString(),
  };

  return apiSuccess(result, { corsOrigin: ctx.corsOrigin });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const POST = withApiMiddleware(async (req, ctx, params) => handlePost(req, ctx, params));
