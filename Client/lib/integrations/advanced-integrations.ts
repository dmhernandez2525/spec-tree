/**
 * F12.3 - Advanced Integrations
 *
 * Integration management for external services including Slack, Jira,
 * Linear, Notion, and Discord. Provides configuration validation,
 * sync rules, webhook endpoints, and event processing.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IntegrationType = 'slack' | 'jira' | 'linear' | 'notion' | 'discord';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  config: Record<string, string>;
  connectedAt?: number;
  lastSyncAt?: number;
}

export type SyncDirection = 'push' | 'pull' | 'bidirectional';

export interface SyncRule {
  id: string;
  integrationId: string;
  sourceField: string;
  targetField: string;
  direction: SyncDirection;
  transform?: string;
}

export interface WebhookEndpoint {
  id: string;
  integrationId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: string;
  payload: Record<string, unknown>;
  processedAt?: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const INTEGRATION_CONFIGS: Record<
  IntegrationType,
  { requiredFields: string[]; optionalFields: string[]; webhookSupported: boolean }
> = {
  slack: {
    requiredFields: ['workspace_url', 'bot_token'],
    optionalFields: ['default_channel', 'signing_secret'],
    webhookSupported: true,
  },
  jira: {
    requiredFields: ['base_url', 'api_token', 'project_key'],
    optionalFields: ['username', 'board_id'],
    webhookSupported: true,
  },
  linear: {
    requiredFields: ['api_key', 'team_id'],
    optionalFields: ['project_id', 'label_prefix'],
    webhookSupported: true,
  },
  notion: {
    requiredFields: ['api_key', 'database_id'],
    optionalFields: ['workspace_name', 'page_icon'],
    webhookSupported: false,
  },
  discord: {
    requiredFields: ['bot_token', 'guild_id'],
    optionalFields: ['default_channel_id', 'webhook_url'],
    webhookSupported: true,
  },
};

export const SUPPORTED_EVENTS: Record<IntegrationType, string[]> = {
  slack: ['message.sent', 'message.updated', 'channel.created', 'reaction.added'],
  jira: ['issue.created', 'issue.updated', 'issue.deleted', 'sprint.started', 'sprint.completed'],
  linear: ['issue.created', 'issue.updated', 'issue.removed', 'cycle.started', 'cycle.completed'],
  notion: ['page.created', 'page.updated', 'database.updated'],
  discord: ['message.sent', 'message.deleted', 'member.joined', 'member.left'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a short unique ID with a given prefix. */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Integration Lifecycle
// ---------------------------------------------------------------------------

/**
 * Create a new integration in pending status.
 *
 * @param type   - The external service type.
 * @param name   - A human-readable label for this integration.
 * @param config - Key/value pairs required by the integration type.
 * @returns A new `Integration` object with a generated id and pending status.
 */
export function createIntegration(
  type: IntegrationType,
  name: string,
  config: Record<string, string>,
): Integration {
  return {
    id: generateId('int'),
    type,
    name,
    status: 'pending',
    config: { ...config },
  };
}

/**
 * Validate that all required fields are present in the config for a given
 * integration type.
 *
 * @param type   - The integration type to validate against.
 * @param config - The configuration to check.
 * @returns An object indicating validity and any missing required fields.
 */
export function validateIntegrationConfig(
  type: IntegrationType,
  config: Record<string, string>,
): { valid: boolean; missingFields: string[] } {
  const { requiredFields } = INTEGRATION_CONFIGS[type];
  const missingFields = requiredFields.filter((field) => !(field in config) || config[field] === '');
  return { valid: missingFields.length === 0, missingFields };
}

/**
 * Transition an integration to the connected state.
 *
 * @param integration - The integration to connect.
 * @returns A new `Integration` with connected status and a connectedAt timestamp.
 */
export function connectIntegration(integration: Integration): Integration {
  return {
    ...integration,
    status: 'connected',
    connectedAt: Date.now(),
  };
}

/**
 * Transition an integration to the disconnected state.
 *
 * @param integration - The integration to disconnect.
 * @returns A new `Integration` with disconnected status.
 */
export function disconnectIntegration(integration: Integration): Integration {
  return {
    ...integration,
    status: 'disconnected',
  };
}

// ---------------------------------------------------------------------------
// Sync Rules
// ---------------------------------------------------------------------------

/**
 * Create a sync rule that maps a source field to a target field across an
 * integration boundary.
 *
 * @param integrationId - The parent integration this rule belongs to.
 * @param sourceField   - The field name on the source side.
 * @param targetField   - The field name on the target side.
 * @param direction     - Whether data flows push, pull, or bidirectionally.
 * @param transform     - Optional transform to apply during sync.
 * @returns A new `SyncRule` with a generated id.
 */
export function createSyncRule(
  integrationId: string,
  sourceField: string,
  targetField: string,
  direction: SyncDirection,
  transform?: string,
): SyncRule {
  return {
    id: generateId('sr'),
    integrationId,
    sourceField,
    targetField,
    direction,
    ...(transform !== undefined ? { transform } : {}),
  };
}

/**
 * Apply a named transform to a string value.
 *
 * Supported transforms:
 * - `uppercase`: converts to upper case
 * - `lowercase`: converts to lower case
 * - `trim`: strips leading and trailing whitespace
 * - `slugify`: lowercases, trims, replaces spaces with hyphens, removes
 *   non-alphanumeric characters (except hyphens)
 * - `undefined` / unrecognized: returns value unchanged
 *
 * @param value     - The input string.
 * @param transform - The transform name to apply.
 * @returns The transformed string.
 */
export function applySyncTransform(value: string, transform?: string): string {
  if (!transform) return value;

  const transforms: Record<string, (v: string) => string> = {
    uppercase: (v) => v.toUpperCase(),
    lowercase: (v) => v.toLowerCase(),
    trim: (v) => v.trim(),
    slugify: (v) =>
      v
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
  };

  const fn = transforms[transform];
  return fn ? fn(value) : value;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

/**
 * Create an active webhook endpoint for an integration.
 *
 * @param integrationId - The integration this endpoint belongs to.
 * @param url           - The URL that will receive webhook payloads.
 * @param events        - The list of event types this endpoint subscribes to.
 * @param secret        - A shared secret for verifying payloads.
 * @returns A new active `WebhookEndpoint`.
 */
export function createWebhookEndpoint(
  integrationId: string,
  url: string,
  events: string[],
  secret: string,
): WebhookEndpoint {
  return {
    id: generateId('wh'),
    integrationId,
    url,
    events: [...events],
    secret,
    active: true,
  };
}

/**
 * Validate that a list of events is supported for the given integration type.
 *
 * @param type   - The integration type to check against.
 * @param events - The events to validate.
 * @returns An object indicating validity and listing any unsupported events.
 */
export function validateWebhookEvents(
  type: IntegrationType,
  events: string[],
): { valid: boolean; invalidEvents: string[] } {
  const supported = SUPPORTED_EVENTS[type];
  const invalidEvents = events.filter((e) => !supported.includes(e));
  return { valid: invalidEvents.length === 0, invalidEvents };
}

// ---------------------------------------------------------------------------
// Event Processing
// ---------------------------------------------------------------------------

/**
 * Mark an integration event as processed by attaching a processedAt timestamp.
 *
 * @param event - The event to process.
 * @returns A new `IntegrationEvent` with the processedAt field set.
 */
export function processEvent(event: IntegrationEvent): IntegrationEvent {
  return {
    ...event,
    processedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Queries and Reporting
// ---------------------------------------------------------------------------

/**
 * Filter a list of integrations by their status.
 *
 * @param integrations - The full list of integrations.
 * @param status       - The status to filter for.
 * @returns Only the integrations matching the given status.
 */
export function getIntegrationsByStatus(
  integrations: Integration[],
  status: IntegrationStatus,
): Integration[] {
  return integrations.filter((i) => i.status === status);
}

/** One hour in milliseconds. */
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Twenty-four hours in milliseconds. */
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Determine the health of an integration based on its status and last sync time.
 *
 * - `healthy`: connected and synced within the last hour
 * - `stale`: connected and synced within the last 24 hours
 * - `unhealthy`: disconnected, in error state, or synced more than 24 hours ago
 *   (also unhealthy if never synced while connected)
 *
 * @param integration - The integration to assess.
 * @returns The health classification.
 */
export function getIntegrationHealth(
  integration: Integration,
): 'healthy' | 'stale' | 'unhealthy' {
  if (integration.status === 'disconnected' || integration.status === 'error') {
    return 'unhealthy';
  }

  if (!integration.lastSyncAt) {
    return 'unhealthy';
  }

  const elapsed = Date.now() - integration.lastSyncAt;

  if (elapsed <= ONE_HOUR_MS) {
    return 'healthy';
  }

  if (elapsed <= TWENTY_FOUR_HOURS_MS) {
    return 'stale';
  }

  return 'unhealthy';
}

/**
 * Build a human-readable summary string describing integration counts by status.
 *
 * Example output:
 *   "Total: 5 | connected: 2, disconnected: 1, error: 1, pending: 1"
 *
 * @param integrations - The list of integrations to summarize.
 * @returns A formatted summary string.
 */
export function formatIntegrationSummary(integrations: Integration[]): string {
  const counts: Record<IntegrationStatus, number> = {
    connected: 0,
    disconnected: 0,
    error: 0,
    pending: 0,
  };

  integrations.forEach((integration) => {
    counts[integration.status] += 1;
  });

  const statusParts = (Object.keys(counts) as IntegrationStatus[])
    .map((status) => `${status}: ${counts[status]}`)
    .join(', ');

  return `Total: ${integrations.length} | ${statusParts}`;
}
