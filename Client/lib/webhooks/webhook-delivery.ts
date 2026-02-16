/**
 * Webhook delivery engine with HMAC-SHA256 signing, latency tracking,
 * exponential-backoff retries, and automatic health-based disabling.
 */

import type { WebhookConfig, WebhookDelivery, WebhookEvent } from '@/types/webhook';
import { RETRY_DELAYS, MAX_RETRY_ATTEMPTS, FAILURE_THRESHOLD } from '@/types/webhook';
import { signPayload, SIGNATURE_HEADER, TIMESTAMP_HEADER } from './webhook-signer';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a short unique ID for delivery records. */
function generateDeliveryId(): string {
  return `dlv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Generate a unique ID for the webhook invocation. */
function generateWebhookRequestId(): string {
  return `whk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Payload Builder
// ---------------------------------------------------------------------------

/**
 * Build the delivery payload for a webhook event.
 *
 * When `payloadFields` is provided and non-empty, only matching top-level
 * keys from `data` are included. The envelope fields (`event`, `timestamp`,
 * `webhookId`) are always present.
 *
 * @param event         - The event type being delivered.
 * @param data          - The full event data.
 * @param payloadFields - Optional list of top-level keys to include.
 * @returns The constructed payload object.
 */
export function buildPayload(
  event: WebhookEvent,
  data: Record<string, unknown>,
  payloadFields?: string[],
): Record<string, unknown> {
  let filteredData: Record<string, unknown>;

  if (payloadFields && payloadFields.length > 0) {
    filteredData = {};
    for (const field of payloadFields) {
      if (field in data) {
        filteredData[field] = data[field];
      }
    }
  } else {
    filteredData = { ...data };
  }

  return {
    event,
    timestamp: new Date().toISOString(),
    data: filteredData,
  };
}

// ---------------------------------------------------------------------------
// Single Delivery
// ---------------------------------------------------------------------------

/**
 * Deliver a single webhook request.
 *
 * Signs the serialized payload with HMAC-SHA256, attaches standard headers,
 * sends the request, and returns a `WebhookDelivery` record that captures
 * the status code, response body, latency, and success flag.
 *
 * @param webhook       - The webhook configuration to deliver to.
 * @param event         - The event type triggering the delivery.
 * @param payload       - The data to send.
 * @param attemptNumber - The current attempt number (1-based).
 * @returns A delivery record describing the outcome.
 */
export async function deliverWebhook(
  webhook: WebhookConfig,
  event: WebhookEvent,
  payload: Record<string, unknown>,
  attemptNumber = 1,
): Promise<WebhookDelivery> {
  const deliveryId = generateDeliveryId();
  const timestamp = Date.now().toString();
  const body = JSON.stringify(payload);

  const signature = await signPayload(body, webhook.secret);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [SIGNATURE_HEADER]: signature,
    [TIMESTAMP_HEADER]: timestamp,
    'X-Webhook-Event': event,
    'X-Webhook-ID': generateWebhookRequestId(),
    ...webhook.customHeaders,
  };

  const start = performance.now();
  let statusCode: number | null = null;
  let responseBody: string | null = null;
  let success = false;

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(30_000), // 30-second timeout
    });

    statusCode = response.status;
    responseBody = await response.text().catch(() => null);
    success = response.ok;
  } catch (error) {
    logger.error('webhook-delivery', 'Delivery failed', {
      webhookId: webhook.id,
      event,
      attemptNumber,
      error,
    });
  }

  const latencyMs = Math.round(performance.now() - start);

  const retryInfo = scheduleRetry({
    id: deliveryId,
    webhookId: webhook.id,
    event,
    payload,
    statusCode,
    responseBody,
    latencyMs,
    attemptNumber,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    nextRetryAt: null,
    createdAt: new Date().toISOString(),
    success,
  });

  return {
    id: deliveryId,
    webhookId: webhook.id,
    event,
    payload,
    statusCode,
    responseBody,
    latencyMs,
    attemptNumber,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    nextRetryAt: retryInfo.shouldRetry
      ? new Date(Date.now() + retryInfo.delay).toISOString()
      : null,
    createdAt: new Date().toISOString(),
    success,
  };
}

// ---------------------------------------------------------------------------
// Retry Scheduling
// ---------------------------------------------------------------------------

/**
 * Determine whether a failed delivery should be retried and the delay before
 * the next attempt.
 *
 * Uses the `RETRY_DELAYS` exponential-backoff array. If the attempt number
 * exceeds available delays (or `MAX_RETRY_ATTEMPTS`), no further retries
 * are scheduled.
 *
 * @param delivery - The delivery record for the most recent attempt.
 * @returns An object with `shouldRetry` and the `delay` in milliseconds.
 */
export function scheduleRetry(delivery: WebhookDelivery): { delay: number; shouldRetry: boolean } {
  if (delivery.success) {
    return { delay: 0, shouldRetry: false };
  }

  if (delivery.attemptNumber >= MAX_RETRY_ATTEMPTS) {
    return { delay: 0, shouldRetry: false };
  }

  const delayIndex = delivery.attemptNumber - 1;
  if (delayIndex >= RETRY_DELAYS.length) {
    return { delay: 0, shouldRetry: false };
  }

  return {
    delay: RETRY_DELAYS[delayIndex],
    shouldRetry: true,
  };
}

// ---------------------------------------------------------------------------
// Delivery with Automatic Retries
// ---------------------------------------------------------------------------

/**
 * Deliver a webhook with automatic exponential-backoff retries.
 *
 * Keeps retrying on failure until the delivery succeeds or the maximum
 * number of attempts is exhausted. Returns the final `WebhookDelivery`
 * record (either successful or the last failed attempt).
 *
 * @param webhook - The webhook configuration.
 * @param event   - The event type.
 * @param payload - The event data.
 * @returns The final delivery record after all attempts.
 */
export async function processWebhookWithRetries(
  webhook: WebhookConfig,
  event: WebhookEvent,
  payload: Record<string, unknown>,
): Promise<WebhookDelivery> {
  let attempt = 1;

  while (attempt <= MAX_RETRY_ATTEMPTS) {
    const delivery = await deliverWebhook(webhook, event, payload, attempt);

    if (delivery.success) {
      logger.info('webhook-delivery', 'Delivery succeeded', {
        webhookId: webhook.id,
        event,
        attempt,
        latencyMs: delivery.latencyMs,
      });
      return delivery;
    }

    const retryInfo = scheduleRetry(delivery);

    if (!retryInfo.shouldRetry) {
      logger.warn('webhook-delivery', 'All retry attempts exhausted', {
        webhookId: webhook.id,
        event,
        totalAttempts: attempt,
      });
      return delivery;
    }

    logger.info('webhook-delivery', 'Scheduling retry', {
      webhookId: webhook.id,
      event,
      attempt,
      nextAttempt: attempt + 1,
      delayMs: retryInfo.delay,
    });

    await new Promise((resolve) => setTimeout(resolve, retryInfo.delay));
    attempt += 1;
  }

  // This point is unreachable, but satisfies the type checker.
  throw new Error('Unexpected: exceeded retry loop without returning');
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

/**
 * Evaluate whether a webhook should be automatically disabled based on
 * its consecutive failure count.
 *
 * When `failureCount` meets or exceeds `FAILURE_THRESHOLD`, the webhook
 * should be set to `disabled` status to prevent further delivery attempts
 * until a user manually re-enables it.
 *
 * @param webhookId    - The webhook ID (included in the response for logging).
 * @param failureCount - The current consecutive failure count.
 * @returns An object indicating whether disabling is recommended and why.
 */
export function checkHealthAndDisable(
  webhookId: string,
  failureCount: number,
): { shouldDisable: boolean; reason: string } {
  if (failureCount >= FAILURE_THRESHOLD) {
    return {
      shouldDisable: true,
      reason:
        `Webhook ${webhookId} has ${failureCount} consecutive failures, ` +
        `which meets or exceeds the threshold of ${FAILURE_THRESHOLD}. ` +
        `The webhook will be automatically disabled.`,
    };
  }

  return {
    shouldDisable: false,
    reason:
      `Webhook ${webhookId} has ${failureCount} consecutive failures ` +
      `(threshold: ${FAILURE_THRESHOLD}). No action required.`,
  };
}
