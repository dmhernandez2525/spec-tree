/**
 * Webhook system types for F3.1.2 - Event-driven webhook delivery
 * with HMAC-SHA256 signing, exponential backoff retries, and
 * pre-built templates for popular services.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Exponential backoff delays in milliseconds for retry attempts */
export const RETRY_DELAYS = [1_000, 2_000, 4_000, 8_000, 16_000] as const;

/** Maximum number of delivery retry attempts before giving up */
export const MAX_RETRY_ATTEMPTS = 5;

/** Consecutive failure count that triggers automatic webhook disabling */
export const FAILURE_THRESHOLD = 10;

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

/** Events that can trigger a webhook delivery */
export type WebhookEvent =
  | 'spec.created'
  | 'spec.updated'
  | 'spec.deleted'
  | 'spec.exported'
  | 'epic.created'
  | 'epic.updated'
  | 'epic.deleted'
  | 'feature.created'
  | 'feature.updated'
  | 'feature.deleted'
  | 'generation.completed';

/** Operational status of a webhook subscription */
export type WebhookStatus = 'active' | 'paused' | 'disabled';

/** Supported third-party services for webhook templates */
export type WebhookService = 'slack' | 'discord' | 'zapier' | 'make' | 'custom';

// ---------------------------------------------------------------------------
// Core Interfaces
// ---------------------------------------------------------------------------

/** A registered webhook subscription */
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  /** HMAC-SHA256 secret (stored as a hash; raw value only shown on creation) */
  secret: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  customHeaders: Record<string, string>;
  /** When set, only these top-level keys are included in the delivery payload */
  payloadFields: string[];
  createdAt: string;
  updatedAt: string;
  failureCount: number;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: number | null;
}

/** Record of a single webhook delivery attempt */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  statusCode: number | null;
  responseBody: string | null;
  latencyMs: number;
  attemptNumber: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  createdAt: string;
  success: boolean;
}

/** Pre-built configuration template for a third-party service */
export interface WebhookTemplate {
  id: string;
  name: string;
  description: string;
  service: WebhookService;
  urlPattern: string;
  defaultHeaders: Record<string, string>;
  payloadTransform: (event: WebhookEvent, data: Record<string, unknown>) => Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Request / Response Types
// ---------------------------------------------------------------------------

/** Body for creating a new webhook subscription */
export interface CreateWebhookRequest {
  name: string;
  url: string;
  events: WebhookEvent[];
  customHeaders?: Record<string, string>;
  payloadFields?: string[];
}

/** Body for updating an existing webhook subscription */
export interface UpdateWebhookRequest {
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  status?: WebhookStatus;
  customHeaders?: Record<string, string>;
  payloadFields?: string[];
}

/** Body for sending a test delivery to a webhook */
export interface TestWebhookRequest {
  webhookId: string;
  event: WebhookEvent;
  payload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Redux State
// ---------------------------------------------------------------------------

/** Redux slice state for the webhook management UI */
export interface WebhookState {
  webhooks: WebhookConfig[];
  deliveries: WebhookDelivery[];
  templates: WebhookTemplate[];
  isLoading: boolean;
  error: string | null;
}
