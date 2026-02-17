/**
 * Pre-built webhook templates for popular third-party services.
 * Each template provides default headers, a URL pattern hint,
 * and a payload transform that converts the SpecTree event format
 * into the target service's expected structure.
 */

import type { WebhookEvent, WebhookTemplate } from '@/types/webhook';

// ---------------------------------------------------------------------------
// Template Definitions
// ---------------------------------------------------------------------------

/**
 * Slack incoming webhook template.
 *
 * Formats events as Slack Block Kit messages with a header, event details,
 * and a contextual timestamp footer.
 */
const slackTemplate: WebhookTemplate = {
  id: 'tmpl_slack',
  name: 'Slack',
  description: 'Send notifications to a Slack channel via Incoming Webhooks.',
  service: 'slack',
  urlPattern: 'https://hooks.slack.com/services/T.../B.../...',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  payloadTransform: (event: WebhookEvent, data: Record<string, unknown>) => ({
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `SpecTree: ${formatEventName(event)}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Event:*\n\`${event}\`` },
          { type: 'mrkdwn', text: `*Timestamp:*\n${new Date().toISOString()}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${JSON.stringify(data, null, 2).slice(0, 2900)}\`\`\``,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Sent by SpecTree Webhook System',
          },
        ],
      },
    ],
  }),
};

/**
 * Discord webhook template.
 *
 * Formats events as Discord embed messages with colour-coded sidebars
 * and structured fields.
 */
const discordTemplate: WebhookTemplate = {
  id: 'tmpl_discord',
  name: 'Discord',
  description: 'Send notifications to a Discord channel via webhooks.',
  service: 'discord',
  urlPattern: 'https://discord.com/api/webhooks/{id}/{token}',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  payloadTransform: (event: WebhookEvent, data: Record<string, unknown>) => ({
    username: 'SpecTree',
    embeds: [
      {
        title: formatEventName(event),
        description: `Event \`${event}\` was triggered.`,
        color: getDiscordColorForEvent(event),
        fields: Object.entries(data)
          .slice(0, 25) // Discord allows a maximum of 25 fields per embed
          .map(([key, value]) => ({
            name: key,
            value: typeof value === 'string' ? value : JSON.stringify(value),
            inline: true,
          })),
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SpecTree Webhook System',
        },
      },
    ],
  }),
};

/**
 * Zapier catch hook template.
 *
 * Sends a flat JSON payload that maps cleanly to Zapier's data model.
 */
const zapierTemplate: WebhookTemplate = {
  id: 'tmpl_zapier',
  name: 'Zapier',
  description: 'Trigger a Zapier Zap via a catch hook URL.',
  service: 'zapier',
  urlPattern: 'https://hooks.zapier.com/hooks/catch/{zap_id}/{hook_id}/',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  payloadTransform: (event: WebhookEvent, data: Record<string, unknown>) => ({
    event,
    event_name: formatEventName(event),
    timestamp: new Date().toISOString(),
    source: 'spectree',
    ...flattenForZapier(data),
  }),
};

/**
 * Make (formerly Integromat) webhook template.
 *
 * Wraps the event data in a structured envelope that Make can parse
 * with its built-in JSON module.
 */
const makeTemplate: WebhookTemplate = {
  id: 'tmpl_make',
  name: 'Make',
  description: 'Send data to a Make (Integromat) custom webhook.',
  service: 'make',
  urlPattern: 'https://hook.us1.make.com/{webhook_id}',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  payloadTransform: (event: WebhookEvent, data: Record<string, unknown>) => ({
    webhook: {
      event,
      eventName: formatEventName(event),
      timestamp: new Date().toISOString(),
      source: 'spectree',
    },
    data,
  }),
};

// ---------------------------------------------------------------------------
// Template Registry
// ---------------------------------------------------------------------------

/** All available pre-built webhook templates */
export const WEBHOOK_TEMPLATES: WebhookTemplate[] = [
  slackTemplate,
  discordTemplate,
  zapierTemplate,
  makeTemplate,
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a template by service name.
 *
 * @param service - The service identifier (e.g. `'slack'`, `'discord'`).
 * @returns The matching template, or `undefined` if none exists.
 */
export function getTemplate(service: string): WebhookTemplate | undefined {
  return WEBHOOK_TEMPLATES.find((t) => t.service === service);
}

/**
 * Apply a template's payload transform to an event and its data.
 *
 * This converts the standard SpecTree event payload into the format
 * expected by the target service.
 *
 * @param template - The template to apply.
 * @param event    - The webhook event type.
 * @param data     - The raw event data from SpecTree.
 * @returns The transformed payload ready for delivery.
 */
export function applyTemplate(
  template: WebhookTemplate,
  event: WebhookEvent,
  data: Record<string, unknown>,
): Record<string, unknown> {
  return template.payloadTransform(event, data);
}

// ---------------------------------------------------------------------------
// Internal Utilities
// ---------------------------------------------------------------------------

/**
 * Convert a dot-delimited event string into a human-readable title.
 * Example: `'spec.created'` becomes `'Spec Created'`.
 */
function formatEventName(event: WebhookEvent): string {
  return event
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Return a Discord embed colour integer based on the event action.
 *
 * - Created  => green  (0x2ecc71)
 * - Updated  => blue   (0x3498db)
 * - Deleted  => red    (0xe74c3c)
 * - Exported / Completed => gold (0xf1c40f)
 */
function getDiscordColorForEvent(event: WebhookEvent): number {
  const colorMap: Record<string, number> = {
    created: 0x2ecc71,
    updated: 0x3498db,
    deleted: 0xe74c3c,
    exported: 0xf1c40f,
    completed: 0xf1c40f,
  };

  const action = event.split('.').pop() || '';
  return colorMap[action] ?? 0x95a5a6;
}

/**
 * Flatten nested data one level deep for Zapier compatibility.
 *
 * Zapier works best with flat key-value pairs, so nested objects are
 * JSON-stringified and prefixed with `data_`.
 */
function flattenForZapier(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && typeof value === 'object') {
      result[`data_${key}`] = JSON.stringify(value);
    } else {
      result[`data_${key}`] = value;
    }
  }

  return result;
}
