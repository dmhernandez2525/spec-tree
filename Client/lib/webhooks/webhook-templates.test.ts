import { describe, it, expect } from 'vitest';
import {
  WEBHOOK_TEMPLATES,
  getTemplate,
  applyTemplate,
} from './webhook-templates';
import type { WebhookEvent } from '@/types/webhook';

describe('webhook-templates', () => {
  const testEvent: WebhookEvent = 'spec.created';
  const testData: Record<string, unknown> = {
    id: 'spec_1',
    name: 'Test Spec',
    version: 1,
  };

  // -----------------------------------------------------------------------
  // WEBHOOK_TEMPLATES constant
  // -----------------------------------------------------------------------

  describe('WEBHOOK_TEMPLATES', () => {
    it('has exactly 4 templates', () => {
      expect(WEBHOOK_TEMPLATES).toHaveLength(4);
    });

    it('contains slack, discord, zapier, and make services', () => {
      const services = WEBHOOK_TEMPLATES.map((t) => t.service);

      expect(services).toContain('slack');
      expect(services).toContain('discord');
      expect(services).toContain('zapier');
      expect(services).toContain('make');
    });
  });

  // -----------------------------------------------------------------------
  // getTemplate
  // -----------------------------------------------------------------------

  describe('getTemplate', () => {
    it('returns the correct template for slack', () => {
      const template = getTemplate('slack');

      expect(template).toBeDefined();
      expect(template!.service).toBe('slack');
      expect(template!.name).toBe('Slack');
    });

    it('returns the correct template for discord', () => {
      const template = getTemplate('discord');

      expect(template).toBeDefined();
      expect(template!.service).toBe('discord');
      expect(template!.name).toBe('Discord');
    });

    it('returns the correct template for zapier', () => {
      const template = getTemplate('zapier');

      expect(template).toBeDefined();
      expect(template!.service).toBe('zapier');
      expect(template!.name).toBe('Zapier');
    });

    it('returns the correct template for make', () => {
      const template = getTemplate('make');

      expect(template).toBeDefined();
      expect(template!.service).toBe('make');
      expect(template!.name).toBe('Make');
    });

    it('returns undefined for an unknown service', () => {
      const template = getTemplate('unknown_service');

      expect(template).toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // applyTemplate
  // -----------------------------------------------------------------------

  describe('applyTemplate', () => {
    it('transforms payload for Slack format (has blocks)', () => {
      const template = getTemplate('slack')!;
      const result = applyTemplate(template, testEvent, testData);

      expect(result).toHaveProperty('blocks');
      expect(Array.isArray(result.blocks)).toBe(true);

      const blocks = result.blocks as Array<{ type: string }>;
      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks[0]).toHaveProperty('type', 'header');
    });

    it('transforms payload for Discord format (has embeds)', () => {
      const template = getTemplate('discord')!;
      const result = applyTemplate(template, testEvent, testData);

      expect(result).toHaveProperty('embeds');
      expect(Array.isArray(result.embeds)).toBe(true);

      const embeds = result.embeds as Array<{ title: string }>;
      expect(embeds).toHaveLength(1);
      expect(embeds[0]).toHaveProperty('title');
      expect(embeds[0]).toHaveProperty('fields');
    });

    it('transforms payload for Zapier format (flat structure)', () => {
      const template = getTemplate('zapier')!;
      const result = applyTemplate(template, testEvent, testData);

      expect(result).toHaveProperty('event', testEvent);
      expect(result).toHaveProperty('event_name');
      expect(result).toHaveProperty('source', 'spectree');
      expect(result).toHaveProperty('timestamp');
    });

    it('transforms payload for Make format (envelope with webhook and data)', () => {
      const template = getTemplate('make')!;
      const result = applyTemplate(template, testEvent, testData);

      expect(result).toHaveProperty('webhook');
      expect(result).toHaveProperty('data', testData);

      const webhook = result.webhook as Record<string, unknown>;
      expect(webhook.event).toBe(testEvent);
      expect(webhook.source).toBe('spectree');
    });
  });
});
