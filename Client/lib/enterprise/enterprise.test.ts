import { describe, it, expect } from 'vitest';
import {
  PLAN_LIMITS,
  createTenant,
  checkPlanLimit,
  upgradePlan,
  validateTenantSlug,
} from './tenant-manager';
import type { Plan, Tenant } from './tenant-manager';
import {
  createAuditLogger,
  formatAuditEvent,
} from './audit-log';
import type { AuditEvent } from './audit-log';

// ─── Helper ────────────────────────────────────────────────────────

function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  const base = createTenant('Test Corp', 'free');
  return { ...base, ...overrides };
}

function makeEvent(overrides: Partial<AuditEvent> = {}): AuditEvent {
  return {
    id: 'evt-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    action: 'create',
    resource: 'project',
    resourceId: 'proj-1',
    details: {},
    timestamp: 1700000000000,
    ip: '127.0.0.1',
    ...overrides,
  };
}

// ─── PLAN_LIMITS Tests ─────────────────────────────────────────────

describe('PLAN_LIMITS', () => {
  it('free plan allows 3 users', () => {
    expect(PLAN_LIMITS.free.maxUsers).toBe(3);
  });

  it('free plan allows 5 projects', () => {
    expect(PLAN_LIMITS.free.maxProjects).toBe(5);
  });

  it('free plan disables custom branding', () => {
    expect(PLAN_LIMITS.free.customBranding).toBe(false);
  });

  it('free plan disables SSO', () => {
    expect(PLAN_LIMITS.free.ssoEnabled).toBe(false);
  });

  it('pro plan allows 25 users', () => {
    expect(PLAN_LIMITS.pro.maxUsers).toBe(25);
  });

  it('pro plan enables audit logs', () => {
    expect(PLAN_LIMITS.pro.auditLogEnabled).toBe(true);
  });

  it('enterprise plan has unlimited users (-1)', () => {
    expect(PLAN_LIMITS.enterprise.maxUsers).toBe(-1);
  });

  it('enterprise plan has unlimited projects (-1)', () => {
    expect(PLAN_LIMITS.enterprise.maxProjects).toBe(-1);
  });

  it('enterprise plan enables SSO', () => {
    expect(PLAN_LIMITS.enterprise.ssoEnabled).toBe(true);
  });

  it('enterprise plan has highest rate limit', () => {
    expect(PLAN_LIMITS.enterprise.apiRateLimit).toBeGreaterThan(PLAN_LIMITS.pro.apiRateLimit);
  });
});

// ─── createTenant Tests ────────────────────────────────────────────

describe('createTenant', () => {
  it('generates a slug from the name', () => {
    const tenant = createTenant('Acme Corp');
    expect(tenant.slug).toBe('acme-corp');
  });

  it('generates a lowercase slug', () => {
    const tenant = createTenant('MY COMPANY');
    expect(tenant.slug).toBe('my-company');
  });

  it('applies free plan limits by default', () => {
    const tenant = createTenant('Default Co');
    expect(tenant.plan).toBe('free');
    expect(tenant.settings.maxUsers).toBe(3);
  });

  it('applies pro plan limits when specified', () => {
    const tenant = createTenant('Pro Co', 'pro');
    expect(tenant.plan).toBe('pro');
    expect(tenant.settings.maxUsers).toBe(25);
  });

  it('generates a unique id', () => {
    const t1 = createTenant('A');
    const t2 = createTenant('B');
    expect(t1.id).not.toBe(t2.id);
  });

  it('includes a createdAt timestamp', () => {
    const tenant = createTenant('Timestamp Co');
    expect(tenant.createdAt).toBeTruthy();
    expect(new Date(tenant.createdAt).getTime()).not.toBeNaN();
  });

  it('preserves the original name', () => {
    const tenant = createTenant('My Startup LLC');
    expect(tenant.name).toBe('My Startup LLC');
  });
});

// ─── checkPlanLimit Tests ──────────────────────────────────────────

describe('checkPlanLimit', () => {
  it('allows when under the limit', () => {
    const tenant = makeTenant();
    const result = checkPlanLimit(tenant, 'maxUsers', 1);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('denies when at the limit', () => {
    const tenant = makeTenant();
    const result = checkPlanLimit(tenant, 'maxUsers', 3);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('denies when over the limit', () => {
    const tenant = makeTenant();
    const result = checkPlanLimit(tenant, 'maxUsers', 5);
    expect(result.allowed).toBe(false);
  });

  it('always allows for unlimited (-1) plans', () => {
    const tenant = createTenant('Enterprise Co', 'enterprise');
    const result = checkPlanLimit(tenant, 'maxUsers', 9999);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(-1);
  });

  it('returns correct current count', () => {
    const tenant = makeTenant();
    const result = checkPlanLimit(tenant, 'maxProjects', 2);
    expect(result.current).toBe(2);
  });

  it('returns correct limit value', () => {
    const tenant = makeTenant();
    const result = checkPlanLimit(tenant, 'maxProjects', 0);
    expect(result.limit).toBe(5);
  });
});

// ─── upgradePlan Tests ─────────────────────────────────────────────

describe('upgradePlan', () => {
  it('updates the plan field', () => {
    const tenant = createTenant('Upgrade Co', 'free');
    const upgraded = upgradePlan(tenant, 'pro');
    expect(upgraded.plan).toBe('pro');
  });

  it('applies new plan settings', () => {
    const tenant = createTenant('Upgrade Co', 'free');
    const upgraded = upgradePlan(tenant, 'pro');
    expect(upgraded.settings.maxUsers).toBe(25);
    expect(upgraded.settings.customBranding).toBe(true);
  });

  it('preserves tenant identity', () => {
    const tenant = createTenant('Upgrade Co', 'free');
    const upgraded = upgradePlan(tenant, 'enterprise');
    expect(upgraded.id).toBe(tenant.id);
    expect(upgraded.name).toBe(tenant.name);
    expect(upgraded.slug).toBe(tenant.slug);
  });

  it('returns a new object (does not mutate original)', () => {
    const tenant = createTenant('Immutable Co', 'free');
    const upgraded = upgradePlan(tenant, 'pro');
    expect(upgraded).not.toBe(tenant);
    expect(tenant.plan).toBe('free');
  });

  it('returns a copy when plan is the same', () => {
    const tenant = createTenant('Same Plan Co', 'pro');
    const result = upgradePlan(tenant, 'pro');
    expect(result).not.toBe(tenant);
    expect(result.plan).toBe('pro');
  });
});

// ─── validateTenantSlug Tests ──────────────────────────────────────

describe('validateTenantSlug', () => {
  it('accepts a valid slug', () => {
    expect(validateTenantSlug('acme-corp').valid).toBe(true);
  });

  it('accepts a slug with numbers', () => {
    expect(validateTenantSlug('team-42').valid).toBe(true);
  });

  it('rejects a slug that is too short', () => {
    const result = validateTenantSlug('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3');
  });

  it('rejects an uppercase slug', () => {
    const result = validateTenantSlug('AcmeCorp');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('lowercase');
  });

  it('rejects a slug starting with a hyphen', () => {
    const result = validateTenantSlug('-bad-slug');
    expect(result.valid).toBe(false);
  });

  it('rejects a slug ending with a hyphen', () => {
    const result = validateTenantSlug('bad-slug-');
    expect(result.valid).toBe(false);
  });

  it('rejects a slug with special characters', () => {
    const result = validateTenantSlug('bad_slug!');
    expect(result.valid).toBe(false);
  });

  it('rejects a slug longer than 50 characters', () => {
    const longSlug = 'a'.repeat(51);
    const result = validateTenantSlug(longSlug);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at most 50');
  });
});

// ─── createAuditLogger Tests ───────────────────────────────────────

describe('createAuditLogger', () => {
  it('starts with zero events', () => {
    const logger = createAuditLogger();
    expect(logger.getEventCount()).toBe(0);
  });

  it('logs an event and increments count', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent());
    expect(logger.getEventCount()).toBe(1);
  });

  it('retrieves logged events', () => {
    const logger = createAuditLogger();
    const event = makeEvent({ id: 'evt-retrieve' });
    logger.log(event);
    const events = logger.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('evt-retrieve');
  });

  it('filters events by user', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent({ userId: 'alice' }));
    logger.log(makeEvent({ userId: 'bob' }));
    logger.log(makeEvent({ userId: 'alice' }));
    expect(logger.filterByUser('alice')).toHaveLength(2);
    expect(logger.filterByUser('bob')).toHaveLength(1);
  });

  it('filters events by action', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent({ action: 'create' }));
    logger.log(makeEvent({ action: 'delete' }));
    logger.log(makeEvent({ action: 'create' }));
    expect(logger.filterByAction('create')).toHaveLength(2);
    expect(logger.filterByAction('delete')).toHaveLength(1);
  });

  it('filters events by date range', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent({ timestamp: 1000 }));
    logger.log(makeEvent({ timestamp: 2000 }));
    logger.log(makeEvent({ timestamp: 3000 }));
    expect(logger.filterByDateRange(1500, 2500)).toHaveLength(1);
    expect(logger.filterByDateRange(1000, 3000)).toHaveLength(3);
  });

  it('returns empty array when no events match filter', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent({ userId: 'alice' }));
    expect(logger.filterByUser('nonexistent')).toHaveLength(0);
  });

  it('clears all events', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent());
    logger.log(makeEvent());
    logger.clear();
    expect(logger.getEventCount()).toBe(0);
    expect(logger.getEvents()).toHaveLength(0);
  });
});

// ─── exportAsCSV Tests ─────────────────────────────────────────────

describe('exportAsCSV', () => {
  it('includes CSV headers', () => {
    const logger = createAuditLogger();
    const csv = logger.exportAsCSV();
    expect(csv).toContain('id,tenantId,userId,action,resource,resourceId,details,timestamp,ip');
  });

  it('includes event data in rows', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent({ id: 'csv-evt-1', userId: 'alice', action: 'create' }));
    const csv = logger.exportAsCSV();
    expect(csv).toContain('csv-evt-1');
    expect(csv).toContain('alice');
    expect(csv).toContain('create');
  });

  it('handles multiple events', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent({ id: 'evt-a' }));
    logger.log(makeEvent({ id: 'evt-b' }));
    const csv = logger.exportAsCSV();
    const lines = csv.split('\n');
    // 1 header + 2 data rows
    expect(lines).toHaveLength(3);
  });

  it('handles null ip gracefully', () => {
    const logger = createAuditLogger();
    logger.log(makeEvent({ ip: null }));
    const csv = logger.exportAsCSV();
    // Last field should be empty string for null ip
    const dataLine = csv.split('\n')[1];
    expect(dataLine.endsWith(',')).toBe(true);
  });
});

// ─── formatAuditEvent Tests ────────────────────────────────────────

describe('formatAuditEvent', () => {
  it('includes the user ID', () => {
    const formatted = formatAuditEvent(makeEvent({ userId: 'user-abc' }));
    expect(formatted).toContain('user-abc');
  });

  it('includes the action', () => {
    const formatted = formatAuditEvent(makeEvent({ action: 'delete' }));
    expect(formatted).toContain('delete');
  });

  it('includes the resource', () => {
    const formatted = formatAuditEvent(makeEvent({ resource: 'spec' }));
    expect(formatted).toContain('spec');
  });

  it('includes the resource ID', () => {
    const formatted = formatAuditEvent(makeEvent({ resourceId: 'spec-42' }));
    expect(formatted).toContain('spec-42');
  });

  it('includes a formatted timestamp', () => {
    const formatted = formatAuditEvent(makeEvent({ timestamp: 1700000000000 }));
    // Should contain an ISO-style date
    expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('returns a non-empty string', () => {
    const formatted = formatAuditEvent(makeEvent());
    expect(formatted.length).toBeGreaterThan(0);
  });
});
