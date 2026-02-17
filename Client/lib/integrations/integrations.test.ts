import { describe, it, expect } from 'vitest';
import {
  INTEGRATION_CONFIGS,
  SUPPORTED_EVENTS,
  createIntegration,
  validateIntegrationConfig,
  connectIntegration,
  disconnectIntegration,
  createSyncRule,
  applySyncTransform,
  createWebhookEndpoint,
  validateWebhookEvents,
  processEvent,
  getIntegrationsByStatus,
  getIntegrationHealth,
  formatIntegrationSummary,
} from './advanced-integrations';
import type { Integration, IntegrationEvent } from './advanced-integrations';

// ---------------------------------------------------------------------------
// INTEGRATION_CONFIGS
// ---------------------------------------------------------------------------

describe('INTEGRATION_CONFIGS', () => {
  it('should have a config for slack', () => {
    expect(INTEGRATION_CONFIGS.slack).toBeDefined();
    expect(INTEGRATION_CONFIGS.slack.requiredFields).toContain('workspace_url');
    expect(INTEGRATION_CONFIGS.slack.requiredFields).toContain('bot_token');
    expect(INTEGRATION_CONFIGS.slack.webhookSupported).toBe(true);
  });

  it('should have a config for jira', () => {
    expect(INTEGRATION_CONFIGS.jira).toBeDefined();
    expect(INTEGRATION_CONFIGS.jira.requiredFields).toContain('base_url');
    expect(INTEGRATION_CONFIGS.jira.requiredFields).toContain('api_token');
    expect(INTEGRATION_CONFIGS.jira.requiredFields).toContain('project_key');
    expect(INTEGRATION_CONFIGS.jira.webhookSupported).toBe(true);
  });

  it('should have a config for linear', () => {
    expect(INTEGRATION_CONFIGS.linear).toBeDefined();
    expect(INTEGRATION_CONFIGS.linear.requiredFields).toContain('api_key');
    expect(INTEGRATION_CONFIGS.linear.requiredFields).toContain('team_id');
    expect(INTEGRATION_CONFIGS.linear.webhookSupported).toBe(true);
  });

  it('should have a config for notion', () => {
    expect(INTEGRATION_CONFIGS.notion).toBeDefined();
    expect(INTEGRATION_CONFIGS.notion.requiredFields).toContain('api_key');
    expect(INTEGRATION_CONFIGS.notion.requiredFields).toContain('database_id');
    expect(INTEGRATION_CONFIGS.notion.webhookSupported).toBe(false);
  });

  it('should have a config for discord', () => {
    expect(INTEGRATION_CONFIGS.discord).toBeDefined();
    expect(INTEGRATION_CONFIGS.discord.requiredFields).toContain('bot_token');
    expect(INTEGRATION_CONFIGS.discord.requiredFields).toContain('guild_id');
    expect(INTEGRATION_CONFIGS.discord.webhookSupported).toBe(true);
  });

  it('should have optionalFields for all types', () => {
    expect(INTEGRATION_CONFIGS.slack.optionalFields.length).toBeGreaterThan(0);
    expect(INTEGRATION_CONFIGS.jira.optionalFields.length).toBeGreaterThan(0);
    expect(INTEGRATION_CONFIGS.linear.optionalFields.length).toBeGreaterThan(0);
    expect(INTEGRATION_CONFIGS.notion.optionalFields.length).toBeGreaterThan(0);
    expect(INTEGRATION_CONFIGS.discord.optionalFields.length).toBeGreaterThan(0);
  });

  it('should have exactly 5 integration types', () => {
    expect(Object.keys(INTEGRATION_CONFIGS)).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// SUPPORTED_EVENTS
// ---------------------------------------------------------------------------

describe('SUPPORTED_EVENTS', () => {
  it('should define events for slack', () => {
    expect(SUPPORTED_EVENTS.slack).toContain('message.sent');
    expect(SUPPORTED_EVENTS.slack).toContain('reaction.added');
  });

  it('should define events for jira', () => {
    expect(SUPPORTED_EVENTS.jira).toContain('issue.created');
    expect(SUPPORTED_EVENTS.jira).toContain('sprint.started');
    expect(SUPPORTED_EVENTS.jira).toContain('sprint.completed');
  });

  it('should define events for linear', () => {
    expect(SUPPORTED_EVENTS.linear).toContain('issue.created');
    expect(SUPPORTED_EVENTS.linear).toContain('cycle.started');
  });

  it('should define events for notion', () => {
    expect(SUPPORTED_EVENTS.notion).toContain('page.created');
    expect(SUPPORTED_EVENTS.notion).toContain('database.updated');
  });

  it('should define events for discord', () => {
    expect(SUPPORTED_EVENTS.discord).toContain('message.sent');
    expect(SUPPORTED_EVENTS.discord).toContain('member.joined');
    expect(SUPPORTED_EVENTS.discord).toContain('member.left');
  });
});

// ---------------------------------------------------------------------------
// createIntegration
// ---------------------------------------------------------------------------

describe('createIntegration', () => {
  it('should create an integration with pending status', () => {
    const integration = createIntegration('slack', 'My Slack', { workspace_url: 'https://x.slack.com', bot_token: 'xoxb-123' });
    expect(integration.status).toBe('pending');
  });

  it('should generate an id starting with int_', () => {
    const integration = createIntegration('jira', 'My Jira', { base_url: 'https://jira.example.com', api_token: 'tok', project_key: 'PROJ' });
    expect(integration.id).toMatch(/^int_/);
  });

  it('should set the correct type', () => {
    const integration = createIntegration('linear', 'Linear Workspace', { api_key: 'lin_key', team_id: 'team1' });
    expect(integration.type).toBe('linear');
  });

  it('should set the correct name', () => {
    const integration = createIntegration('notion', 'Notion DB', { api_key: 'ntn_key', database_id: 'db1' });
    expect(integration.name).toBe('Notion DB');
  });

  it('should copy the config object', () => {
    const original = { bot_token: 'tok', guild_id: 'guild1' };
    const integration = createIntegration('discord', 'Discord Server', original);
    expect(integration.config).toEqual(original);
    expect(integration.config).not.toBe(original);
  });

  it('should not have connectedAt set', () => {
    const integration = createIntegration('slack', 'Slack', { workspace_url: 'url', bot_token: 'tok' });
    expect(integration.connectedAt).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// validateIntegrationConfig
// ---------------------------------------------------------------------------

describe('validateIntegrationConfig', () => {
  it('should return valid when all required fields are present for slack', () => {
    const result = validateIntegrationConfig('slack', { workspace_url: 'url', bot_token: 'tok' });
    expect(result.valid).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it('should return invalid when a required field is missing', () => {
    const result = validateIntegrationConfig('slack', { workspace_url: 'url' });
    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('bot_token');
  });

  it('should detect empty string as missing', () => {
    const result = validateIntegrationConfig('slack', { workspace_url: '', bot_token: 'tok' });
    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain('workspace_url');
  });

  it('should validate all required jira fields', () => {
    const result = validateIntegrationConfig('jira', { base_url: 'url', api_token: 'tok', project_key: 'KEY' });
    expect(result.valid).toBe(true);
  });

  it('should report multiple missing fields', () => {
    const result = validateIntegrationConfig('jira', {});
    expect(result.missingFields).toContain('base_url');
    expect(result.missingFields).toContain('api_token');
    expect(result.missingFields).toContain('project_key');
    expect(result.missingFields).toHaveLength(3);
  });

  it('should accept extra fields without complaint', () => {
    const result = validateIntegrationConfig('linear', { api_key: 'key', team_id: 'tid', extra_field: 'ignored' });
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// connectIntegration
// ---------------------------------------------------------------------------

describe('connectIntegration', () => {
  it('should return status connected', () => {
    const base = createIntegration('slack', 'Slack', { workspace_url: 'url', bot_token: 'tok' });
    const connected = connectIntegration(base);
    expect(connected.status).toBe('connected');
  });

  it('should set connectedAt to a number', () => {
    const base = createIntegration('slack', 'Slack', { workspace_url: 'url', bot_token: 'tok' });
    const connected = connectIntegration(base);
    expect(typeof connected.connectedAt).toBe('number');
  });

  it('should preserve original fields', () => {
    const base = createIntegration('jira', 'Jira', { base_url: 'u', api_token: 't', project_key: 'P' });
    const connected = connectIntegration(base);
    expect(connected.name).toBe('Jira');
    expect(connected.type).toBe('jira');
    expect(connected.config).toEqual(base.config);
  });
});

// ---------------------------------------------------------------------------
// disconnectIntegration
// ---------------------------------------------------------------------------

describe('disconnectIntegration', () => {
  it('should return status disconnected', () => {
    const base = connectIntegration(createIntegration('slack', 'S', { workspace_url: 'u', bot_token: 't' }));
    const disconnected = disconnectIntegration(base);
    expect(disconnected.status).toBe('disconnected');
  });

  it('should preserve other fields', () => {
    const base = connectIntegration(createIntegration('discord', 'D', { bot_token: 'tok', guild_id: 'g' }));
    const disconnected = disconnectIntegration(base);
    expect(disconnected.type).toBe('discord');
    expect(disconnected.name).toBe('D');
  });
});

// ---------------------------------------------------------------------------
// createSyncRule
// ---------------------------------------------------------------------------

describe('createSyncRule', () => {
  it('should generate an id starting with sr_', () => {
    const rule = createSyncRule('int_1', 'title', 'summary', 'push');
    expect(rule.id).toMatch(/^sr_/);
  });

  it('should set the correct integrationId', () => {
    const rule = createSyncRule('int_abc', 'title', 'summary', 'pull');
    expect(rule.integrationId).toBe('int_abc');
  });

  it('should set sourceField and targetField', () => {
    const rule = createSyncRule('int_1', 'name', 'title', 'bidirectional');
    expect(rule.sourceField).toBe('name');
    expect(rule.targetField).toBe('title');
  });

  it('should set the direction', () => {
    const rule = createSyncRule('int_1', 'a', 'b', 'bidirectional');
    expect(rule.direction).toBe('bidirectional');
  });

  it('should include transform when provided', () => {
    const rule = createSyncRule('int_1', 'a', 'b', 'push', 'uppercase');
    expect(rule.transform).toBe('uppercase');
  });

  it('should omit transform when not provided', () => {
    const rule = createSyncRule('int_1', 'a', 'b', 'push');
    expect(rule).not.toHaveProperty('transform');
  });
});

// ---------------------------------------------------------------------------
// applySyncTransform
// ---------------------------------------------------------------------------

describe('applySyncTransform', () => {
  it('should convert to uppercase', () => {
    expect(applySyncTransform('hello world', 'uppercase')).toBe('HELLO WORLD');
  });

  it('should convert to lowercase', () => {
    expect(applySyncTransform('Hello WORLD', 'lowercase')).toBe('hello world');
  });

  it('should trim whitespace', () => {
    expect(applySyncTransform('  hello  ', 'trim')).toBe('hello');
  });

  it('should slugify a string', () => {
    expect(applySyncTransform('Hello World!', 'slugify')).toBe('hello-world');
  });

  it('should slugify with extra spaces', () => {
    expect(applySyncTransform('  My Cool Feature  ', 'slugify')).toBe('my-cool-feature');
  });

  it('should return value unchanged when transform is undefined', () => {
    expect(applySyncTransform('unchanged', undefined)).toBe('unchanged');
  });

  it('should return value unchanged for unrecognized transform', () => {
    expect(applySyncTransform('data', 'nonexistent')).toBe('data');
  });

  it('should handle slugify removing special characters', () => {
    expect(applySyncTransform('foo@bar#baz', 'slugify')).toBe('foobarbaz');
  });
});

// ---------------------------------------------------------------------------
// createWebhookEndpoint
// ---------------------------------------------------------------------------

describe('createWebhookEndpoint', () => {
  it('should set active to true by default', () => {
    const endpoint = createWebhookEndpoint('int_1', 'https://example.com/hook', ['message.sent'], 'secret123');
    expect(endpoint.active).toBe(true);
  });

  it('should generate an id starting with wh_', () => {
    const endpoint = createWebhookEndpoint('int_1', 'https://example.com/hook', ['message.sent'], 'sec');
    expect(endpoint.id).toMatch(/^wh_/);
  });

  it('should set integrationId correctly', () => {
    const endpoint = createWebhookEndpoint('int_abc', 'https://h.com', [], 's');
    expect(endpoint.integrationId).toBe('int_abc');
  });

  it('should set the url', () => {
    const endpoint = createWebhookEndpoint('int_1', 'https://hooks.slack.com/test', ['message.sent'], 's');
    expect(endpoint.url).toBe('https://hooks.slack.com/test');
  });

  it('should copy the events array', () => {
    const events = ['issue.created', 'issue.updated'];
    const endpoint = createWebhookEndpoint('int_1', 'http://h.com', events, 's');
    expect(endpoint.events).toEqual(events);
    expect(endpoint.events).not.toBe(events);
  });

  it('should set the secret', () => {
    const endpoint = createWebhookEndpoint('int_1', 'http://h.com', [], 'my-secret');
    expect(endpoint.secret).toBe('my-secret');
  });
});

// ---------------------------------------------------------------------------
// validateWebhookEvents
// ---------------------------------------------------------------------------

describe('validateWebhookEvents', () => {
  it('should return valid for known slack events', () => {
    const result = validateWebhookEvents('slack', ['message.sent', 'reaction.added']);
    expect(result.valid).toBe(true);
    expect(result.invalidEvents).toHaveLength(0);
  });

  it('should return invalid for unknown events', () => {
    const result = validateWebhookEvents('slack', ['unknown.event']);
    expect(result.valid).toBe(false);
    expect(result.invalidEvents).toContain('unknown.event');
  });

  it('should detect mixed valid and invalid events', () => {
    const result = validateWebhookEvents('jira', ['issue.created', 'bogus.event']);
    expect(result.valid).toBe(false);
    expect(result.invalidEvents).toEqual(['bogus.event']);
  });

  it('should return valid for an empty events array', () => {
    const result = validateWebhookEvents('linear', []);
    expect(result.valid).toBe(true);
    expect(result.invalidEvents).toHaveLength(0);
  });

  it('should validate discord events correctly', () => {
    const result = validateWebhookEvents('discord', ['message.sent', 'member.joined']);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// processEvent
// ---------------------------------------------------------------------------

describe('processEvent', () => {
  it('should set processedAt to a number', () => {
    const event: IntegrationEvent = {
      id: 'evt_1',
      integrationId: 'int_1',
      type: 'message.sent',
      payload: { text: 'hello' },
    };
    const processed = processEvent(event);
    expect(typeof processed.processedAt).toBe('number');
  });

  it('should preserve all original event fields', () => {
    const event: IntegrationEvent = {
      id: 'evt_2',
      integrationId: 'int_2',
      type: 'issue.created',
      payload: { title: 'Bug report' },
    };
    const processed = processEvent(event);
    expect(processed.id).toBe('evt_2');
    expect(processed.integrationId).toBe('int_2');
    expect(processed.type).toBe('issue.created');
    expect(processed.payload).toEqual({ title: 'Bug report' });
  });
});

// ---------------------------------------------------------------------------
// getIntegrationsByStatus
// ---------------------------------------------------------------------------

describe('getIntegrationsByStatus', () => {
  const integrations: Integration[] = [
    { id: '1', type: 'slack', name: 'S1', status: 'connected', config: {} },
    { id: '2', type: 'jira', name: 'J1', status: 'disconnected', config: {} },
    { id: '3', type: 'linear', name: 'L1', status: 'connected', config: {} },
    { id: '4', type: 'notion', name: 'N1', status: 'error', config: {} },
    { id: '5', type: 'discord', name: 'D1', status: 'pending', config: {} },
  ];

  it('should filter connected integrations', () => {
    const result = getIntegrationsByStatus(integrations, 'connected');
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.id)).toEqual(['1', '3']);
  });

  it('should filter disconnected integrations', () => {
    const result = getIntegrationsByStatus(integrations, 'disconnected');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should return empty array when no match', () => {
    const onlyConnected: Integration[] = [
      { id: '1', type: 'slack', name: 'S', status: 'connected', config: {} },
    ];
    const result = getIntegrationsByStatus(onlyConnected, 'error');
    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const result = getIntegrationsByStatus([], 'connected');
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getIntegrationHealth
// ---------------------------------------------------------------------------

describe('getIntegrationHealth', () => {
  it('should return healthy when synced within the last hour', () => {
    const integration: Integration = {
      id: '1', type: 'slack', name: 'S', status: 'connected', config: {},
      lastSyncAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    };
    expect(getIntegrationHealth(integration)).toBe('healthy');
  });

  it('should return stale when synced between 1 and 24 hours ago', () => {
    const integration: Integration = {
      id: '1', type: 'slack', name: 'S', status: 'connected', config: {},
      lastSyncAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
    };
    expect(getIntegrationHealth(integration)).toBe('stale');
  });

  it('should return unhealthy when synced more than 24 hours ago', () => {
    const integration: Integration = {
      id: '1', type: 'slack', name: 'S', status: 'connected', config: {},
      lastSyncAt: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
    };
    expect(getIntegrationHealth(integration)).toBe('unhealthy');
  });

  it('should return unhealthy when status is disconnected', () => {
    const integration: Integration = {
      id: '1', type: 'slack', name: 'S', status: 'disconnected', config: {},
      lastSyncAt: Date.now(),
    };
    expect(getIntegrationHealth(integration)).toBe('unhealthy');
  });

  it('should return unhealthy when status is error', () => {
    const integration: Integration = {
      id: '1', type: 'slack', name: 'S', status: 'error', config: {},
      lastSyncAt: Date.now(),
    };
    expect(getIntegrationHealth(integration)).toBe('unhealthy');
  });

  it('should return unhealthy when lastSyncAt is not set', () => {
    const integration: Integration = {
      id: '1', type: 'slack', name: 'S', status: 'connected', config: {},
    };
    expect(getIntegrationHealth(integration)).toBe('unhealthy');
  });

  it('should return healthy when synced exactly now', () => {
    const integration: Integration = {
      id: '1', type: 'slack', name: 'S', status: 'connected', config: {},
      lastSyncAt: Date.now(),
    };
    expect(getIntegrationHealth(integration)).toBe('healthy');
  });
});

// ---------------------------------------------------------------------------
// formatIntegrationSummary
// ---------------------------------------------------------------------------

describe('formatIntegrationSummary', () => {
  it('should return correct counts for mixed statuses', () => {
    const integrations: Integration[] = [
      { id: '1', type: 'slack', name: 'S1', status: 'connected', config: {} },
      { id: '2', type: 'jira', name: 'J1', status: 'disconnected', config: {} },
      { id: '3', type: 'linear', name: 'L1', status: 'connected', config: {} },
      { id: '4', type: 'notion', name: 'N1', status: 'error', config: {} },
      { id: '5', type: 'discord', name: 'D1', status: 'pending', config: {} },
    ];
    const summary = formatIntegrationSummary(integrations);
    expect(summary).toContain('Total: 5');
    expect(summary).toContain('connected: 2');
    expect(summary).toContain('disconnected: 1');
    expect(summary).toContain('error: 1');
    expect(summary).toContain('pending: 1');
  });

  it('should handle empty array', () => {
    const summary = formatIntegrationSummary([]);
    expect(summary).toContain('Total: 0');
    expect(summary).toContain('connected: 0');
    expect(summary).toContain('disconnected: 0');
    expect(summary).toContain('error: 0');
    expect(summary).toContain('pending: 0');
  });

  it('should format with pipe separator', () => {
    const integrations: Integration[] = [
      { id: '1', type: 'slack', name: 'S1', status: 'connected', config: {} },
    ];
    const summary = formatIntegrationSummary(integrations);
    expect(summary).toMatch(/Total: 1 \|/);
  });
});
