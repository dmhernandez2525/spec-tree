/**
 * Constants, types, and validation helpers for the WebhookForm component.
 * Extracted to keep the form component under 300 lines.
 */

import type { WebhookEvent, WebhookService } from '@/types/webhook';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** All available webhook events for the multi-select */
export const ALL_EVENTS: WebhookEvent[] = [
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

/** Top-level payload field names available for filtering */
export const PAYLOAD_FIELDS = [
  'id',
  'name',
  'description',
  'status',
  'createdAt',
  'updatedAt',
  'metadata',
] as const;

// ---------------------------------------------------------------------------
// Template Presets
// ---------------------------------------------------------------------------

export interface TemplatePreset {
  label: string;
  service: WebhookService;
  urlPattern: string;
  description: string;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    label: 'Slack',
    service: 'slack',
    urlPattern: 'https://hooks.slack.com/services/',
    description: 'Post webhook events to a Slack channel via Incoming Webhooks.',
  },
  {
    label: 'Discord',
    service: 'discord',
    urlPattern: 'https://discord.com/api/webhooks/',
    description: 'Send notifications to a Discord channel webhook.',
  },
  {
    label: 'Zapier',
    service: 'zapier',
    urlPattern: 'https://hooks.zapier.com/hooks/catch/',
    description: 'Trigger Zapier automations from SpecTree events.',
  },
  {
    label: 'Make',
    service: 'make',
    urlPattern: 'https://hook.make.com/',
    description: 'Connect SpecTree events to Make (formerly Integromat) scenarios.',
  },
  {
    label: 'Custom',
    service: 'custom',
    urlPattern: 'https://',
    description: 'Send raw JSON payloads to any HTTPS endpoint.',
  },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface ValidationErrors {
  name?: string;
  url?: string;
  events?: string;
}

export function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateWebhookForm(
  name: string,
  url: string,
  events: WebhookEvent[],
): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!name.trim()) errors.name = 'Name is required.';
  if (!isValidHttpsUrl(url)) errors.url = 'A valid HTTPS URL is required.';
  if (events.length === 0) errors.events = 'Select at least one event.';
  return errors;
}
