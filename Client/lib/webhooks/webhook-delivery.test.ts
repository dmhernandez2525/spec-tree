import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPayload, scheduleRetry, checkHealthAndDisable } from './webhook-delivery';
import { RETRY_DELAYS, MAX_RETRY_ATTEMPTS, FAILURE_THRESHOLD } from '@/types/webhook';
import type { WebhookDelivery, WebhookEvent } from '@/types/webhook';

// Mock the logger so delivery internals do not produce console output
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the signer (used only by deliverWebhook, which we do not test here)
vi.mock('./webhook-signer', () => ({
  signPayload: vi.fn().mockResolvedValue('abc123'),
  SIGNATURE_HEADER: 'X-Webhook-Signature',
  TIMESTAMP_HEADER: 'X-Webhook-Timestamp',
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDelivery(overrides: Partial<WebhookDelivery> = {}): WebhookDelivery {
  return {
    id: 'dlv_test',
    webhookId: 'whk_1',
    event: 'spec.created' as WebhookEvent,
    payload: {},
    statusCode: 500,
    responseBody: null,
    latencyMs: 100,
    attemptNumber: 1,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    nextRetryAt: null,
    createdAt: new Date().toISOString(),
    success: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('webhook-delivery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // buildPayload
  // -----------------------------------------------------------------------

  describe('buildPayload', () => {
    const event: WebhookEvent = 'spec.created';
    const data = { id: '1', name: 'My Spec', version: 2, private: true };

    it('creates an envelope with event, timestamp, and data', () => {
      const payload = buildPayload(event, data);

      expect(payload).toHaveProperty('event', event);
      expect(payload).toHaveProperty('timestamp');
      expect(typeof payload.timestamp).toBe('string');
      expect(payload).toHaveProperty('data');
      expect(payload.data).toEqual(data);
    });

    it('filters fields when payloadFields is provided', () => {
      const payload = buildPayload(event, data, ['id', 'name']);

      expect(payload.event).toBe(event);
      expect(payload.data).toEqual({ id: '1', name: 'My Spec' });
    });

    it('returns full data when payloadFields is an empty array', () => {
      const payload = buildPayload(event, data, []);

      expect(payload.data).toEqual(data);
    });

    it('ignores payloadFields that do not exist in data', () => {
      const payload = buildPayload(event, data, ['id', 'nonexistent']);

      expect(payload.data).toEqual({ id: '1' });
    });
  });

  // -----------------------------------------------------------------------
  // scheduleRetry
  // -----------------------------------------------------------------------

  describe('scheduleRetry', () => {
    it('returns correct delay from the RETRY_DELAYS array for each attempt', () => {
      for (let attempt = 1; attempt <= RETRY_DELAYS.length; attempt++) {
        const result = scheduleRetry(makeDelivery({ attemptNumber: attempt }));

        expect(result.shouldRetry).toBe(attempt < MAX_RETRY_ATTEMPTS);
        if (result.shouldRetry) {
          expect(result.delay).toBe(RETRY_DELAYS[attempt - 1]);
        }
      }
    });

    it('returns shouldRetry=false when max attempts are reached', () => {
      const result = scheduleRetry(makeDelivery({ attemptNumber: MAX_RETRY_ATTEMPTS }));

      expect(result.shouldRetry).toBe(false);
      expect(result.delay).toBe(0);
    });

    it('returns shouldRetry=false when the delivery was successful', () => {
      const result = scheduleRetry(makeDelivery({ success: true, attemptNumber: 1 }));

      expect(result.shouldRetry).toBe(false);
      expect(result.delay).toBe(0);
    });

    it('returns shouldRetry=true with first delay on first failed attempt', () => {
      const result = scheduleRetry(makeDelivery({ attemptNumber: 1, success: false }));

      expect(result.shouldRetry).toBe(true);
      expect(result.delay).toBe(RETRY_DELAYS[0]);
    });
  });

  // -----------------------------------------------------------------------
  // checkHealthAndDisable
  // -----------------------------------------------------------------------

  describe('checkHealthAndDisable', () => {
    it('returns shouldDisable=true when failure count equals the threshold', () => {
      const result = checkHealthAndDisable('whk_1', FAILURE_THRESHOLD);

      expect(result.shouldDisable).toBe(true);
      expect(result.reason).toContain('automatically disabled');
    });

    it('returns shouldDisable=true when failure count exceeds the threshold', () => {
      const result = checkHealthAndDisable('whk_1', FAILURE_THRESHOLD + 5);

      expect(result.shouldDisable).toBe(true);
    });

    it('returns shouldDisable=false when failure count is under the threshold', () => {
      const result = checkHealthAndDisable('whk_1', FAILURE_THRESHOLD - 1);

      expect(result.shouldDisable).toBe(false);
      expect(result.reason).toContain('No action required');
    });

    it('returns shouldDisable=false when failure count is zero', () => {
      const result = checkHealthAndDisable('whk_1', 0);

      expect(result.shouldDisable).toBe(false);
    });

    it('includes the webhook ID in the reason string', () => {
      const result = checkHealthAndDisable('whk_abc', 0);

      expect(result.reason).toContain('whk_abc');
    });
  });
});
