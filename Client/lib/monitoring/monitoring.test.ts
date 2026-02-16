import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  createErrorTracker,
  setupGlobalErrorHandler,
  formatErrorReport,
  type ErrorTracker,
  type TrackedError,
  type ErrorSeverity,
} from './error-tracker';

import {
  checkEndpointHealth,
  aggregateHealth,
  createHealthMonitor,
  type HealthCheckResult,
  type ServiceStatus,
} from './health-check';

import {
  createUsageTracker,
  TRACKED_FEATURES,
  type UsageTracker,
} from './usage-metrics';

import {
  createUptimeTracker,
  formatUptime,
  getUptimeColor,
  type UptimeTracker,
} from './uptime-tracker';

// ---------------------------------------------------------------------------
// Error Tracker Tests
// ---------------------------------------------------------------------------

describe('error-tracker', () => {
  let tracker: ErrorTracker;

  beforeEach(() => {
    tracker = createErrorTracker();
  });

  describe('capture', () => {
    it('stores an error with default severity', () => {
      const result = tracker.capture(new Error('test error'));

      expect(result.message).toBe('test error');
      expect(result.severity).toBe('error');
      expect(result.count).toBe(1);
      expect(result.id).toMatch(/^err_/);
    });

    it('stores an error with custom severity', () => {
      const result = tracker.capture('warning msg', 'warning');

      expect(result.severity).toBe('warning');
      expect(result.message).toBe('warning msg');
    });

    it('stores context on the error', () => {
      const result = tracker.capture('ctx error', 'error', { userId: '123' });

      expect(result.context).toEqual({ userId: '123' });
    });

    it('deduplicates errors with the same message', () => {
      tracker.capture(new Error('duplicate'));
      const second = tracker.capture(new Error('duplicate'));

      expect(second.count).toBe(2);
      expect(tracker.getErrors()).toHaveLength(1);
    });

    it('increments count for repeated errors', () => {
      tracker.capture('repeated');
      tracker.capture('repeated');
      tracker.capture('repeated');

      const errors = tracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].count).toBe(3);
    });

    it('updates lastSeen on duplicate capture', () => {
      const first = tracker.capture('timing test');
      const firstSeen = first.firstSeen;

      const second = tracker.capture('timing test');

      expect(second.firstSeen).toBe(firstSeen);
      expect(second.lastSeen).toBeGreaterThanOrEqual(firstSeen);
    });

    it('merges context on duplicate capture', () => {
      tracker.capture('merge ctx', 'error', { a: 1 });
      const result = tracker.capture('merge ctx', 'error', { b: 2 });

      expect(result.context).toEqual({ a: 1, b: 2 });
    });

    it('handles string errors', () => {
      const result = tracker.capture('simple string');

      expect(result.message).toBe('simple string');
      expect(result.stack).toBeNull();
    });

    it('handles non-standard error types', () => {
      const result = tracker.capture(42);

      expect(result.message).toBe('42');
      expect(result.stack).toBeNull();
    });

    it('extracts stack from Error objects', () => {
      const err = new Error('stack test');
      const result = tracker.capture(err);

      expect(result.stack).toBeTruthy();
      expect(result.stack).toContain('stack test');
    });

    it('tracks multiple different errors separately', () => {
      tracker.capture('error A');
      tracker.capture('error B');
      tracker.capture('error C');

      expect(tracker.getErrors()).toHaveLength(3);
    });
  });

  describe('getErrorsBySeverity', () => {
    it('filters errors by severity', () => {
      tracker.capture('fatal issue', 'fatal');
      tracker.capture('error issue', 'error');
      tracker.capture('warning issue', 'warning');
      tracker.capture('info issue', 'info');

      expect(tracker.getErrorsBySeverity('fatal')).toHaveLength(1);
      expect(tracker.getErrorsBySeverity('error')).toHaveLength(1);
      expect(tracker.getErrorsBySeverity('warning')).toHaveLength(1);
      expect(tracker.getErrorsBySeverity('info')).toHaveLength(1);
    });

    it('returns empty array when no errors match severity', () => {
      tracker.capture('only warning', 'warning');

      expect(tracker.getErrorsBySeverity('fatal')).toHaveLength(0);
    });

    it('returns multiple errors of the same severity', () => {
      tracker.capture('warn 1', 'warning');
      tracker.capture('warn 2', 'warning');
      tracker.capture('warn 3', 'warning');

      expect(tracker.getErrorsBySeverity('warning')).toHaveLength(3);
    });
  });

  describe('getTopErrors', () => {
    it('returns errors sorted by count descending', () => {
      tracker.capture('low');
      tracker.capture('high');
      tracker.capture('high');
      tracker.capture('high');
      tracker.capture('medium');
      tracker.capture('medium');

      const top = tracker.getTopErrors();

      expect(top[0].message).toBe('high');
      expect(top[0].count).toBe(3);
      expect(top[1].message).toBe('medium');
      expect(top[1].count).toBe(2);
      expect(top[2].message).toBe('low');
      expect(top[2].count).toBe(1);
    });

    it('respects the limit parameter', () => {
      tracker.capture('a');
      tracker.capture('b');
      tracker.capture('c');
      tracker.capture('d');

      const top = tracker.getTopErrors(2);
      expect(top).toHaveLength(2);
    });

    it('returns all errors when limit exceeds total', () => {
      tracker.capture('only one');

      const top = tracker.getTopErrors(100);
      expect(top).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('removes all tracked errors', () => {
      tracker.capture('err 1');
      tracker.capture('err 2');

      tracker.clear();

      expect(tracker.getErrors()).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('returns correct totals', () => {
      tracker.capture('a', 'error');
      tracker.capture('a', 'error'); // duplicate, count=2
      tracker.capture('b', 'warning');
      tracker.capture('c', 'fatal');

      const stats = tracker.getStats();

      expect(stats.total).toBe(4);
      expect(stats.uniqueCount).toBe(3);
    });

    it('returns correct severity breakdown', () => {
      tracker.capture('e1', 'error');
      tracker.capture('e2', 'error');
      tracker.capture('w1', 'warning');
      tracker.capture('f1', 'fatal');
      tracker.capture('i1', 'info');

      const stats = tracker.getStats();

      expect(stats.bySeverity.error).toBe(2);
      expect(stats.bySeverity.warning).toBe(1);
      expect(stats.bySeverity.fatal).toBe(1);
      expect(stats.bySeverity.info).toBe(1);
    });

    it('returns zero stats when empty', () => {
      const stats = tracker.getStats();

      expect(stats.total).toBe(0);
      expect(stats.uniqueCount).toBe(0);
      expect(stats.bySeverity.error).toBe(0);
      expect(stats.bySeverity.fatal).toBe(0);
      expect(stats.bySeverity.warning).toBe(0);
      expect(stats.bySeverity.info).toBe(0);
    });
  });

  describe('formatErrorReport', () => {
    it('generates report with error messages', () => {
      const errors: TrackedError[] = [
        {
          id: 'err_1',
          message: 'Something went wrong',
          stack: null,
          severity: 'error',
          timestamp: Date.now(),
          context: {},
          count: 3,
          firstSeen: Date.now() - 1000,
          lastSeen: Date.now(),
        },
      ];

      const report = formatErrorReport(errors);

      expect(report).toContain('# Error Report');
      expect(report).toContain('Something went wrong');
      expect(report).toContain('**Count:** 3');
      expect(report).toContain('ERROR');
    });

    it('includes stack trace when present', () => {
      const errors: TrackedError[] = [
        {
          id: 'err_2',
          message: 'Stack error',
          stack: 'Error: Stack error\n    at test.ts:10',
          severity: 'fatal',
          timestamp: Date.now(),
          context: {},
          count: 1,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
        },
      ];

      const report = formatErrorReport(errors);

      expect(report).toContain('Error: Stack error');
      expect(report).toContain('at test.ts:10');
    });

    it('returns no-errors message for empty array', () => {
      const report = formatErrorReport([]);

      expect(report).toContain('No errors recorded');
    });

    it('includes context when present', () => {
      const errors: TrackedError[] = [
        {
          id: 'err_3',
          message: 'Context error',
          stack: null,
          severity: 'warning',
          timestamp: Date.now(),
          context: { userId: 'abc' },
          count: 1,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
        },
      ];

      const report = formatErrorReport(errors);

      expect(report).toContain('userId');
      expect(report).toContain('abc');
    });
  });

  describe('setupGlobalErrorHandler', () => {
    it('attaches and removes event listeners', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      const cleanup = setupGlobalErrorHandler(tracker);

      expect(addSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

      cleanup();

      expect(removeSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });
  });
});

// ---------------------------------------------------------------------------
// Health Check Tests
// ---------------------------------------------------------------------------

describe('health-check', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('checkEndpointHealth', () => {
    it('returns healthy status on successful response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('OK', { status: 200, statusText: 'OK' }),
      );

      const result = await checkEndpointHealth('http://localhost/health');

      expect(result.status).toBe('healthy');
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.message).toBeNull();
    });

    it('returns degraded status on non-OK response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('Server Error', { status: 500, statusText: 'Internal Server Error' }),
      );

      const result = await checkEndpointHealth('http://localhost/health');

      expect(result.status).toBe('degraded');
      expect(result.message).toContain('500');
    });

    it('returns down status on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await checkEndpointHealth('http://localhost/health');

      expect(result.status).toBe('down');
      expect(result.message).toBe('Network error');
    });

    it('returns down status on timeout', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(
        new DOMException('The operation was aborted', 'AbortError'),
      );

      const result = await checkEndpointHealth('http://localhost/health', 100);

      expect(result.status).toBe('down');
      expect(result.message).toContain('timed out');
      expect(result.latency).toBeNull();
    });

    it('sets lastChecked to current timestamp', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('OK', { status: 200 }),
      );

      const before = Date.now();
      const result = await checkEndpointHealth('http://localhost/health');

      expect(result.lastChecked).toBeGreaterThanOrEqual(before);
    });
  });

  describe('aggregateHealth', () => {
    it('returns healthy when all services are healthy', () => {
      const results: HealthCheckResult[] = [
        { service: 'api', status: 'healthy', latency: 50, lastChecked: Date.now(), message: null },
        { service: 'db', status: 'healthy', latency: 30, lastChecked: Date.now(), message: null },
      ];

      expect(aggregateHealth(results)).toBe('healthy');
    });

    it('returns degraded when some services are down', () => {
      const results: HealthCheckResult[] = [
        { service: 'api', status: 'healthy', latency: 50, lastChecked: Date.now(), message: null },
        { service: 'db', status: 'down', latency: null, lastChecked: Date.now(), message: 'down' },
      ];

      expect(aggregateHealth(results)).toBe('degraded');
    });

    it('returns down when all services are down', () => {
      const results: HealthCheckResult[] = [
        { service: 'api', status: 'down', latency: null, lastChecked: Date.now(), message: 'err' },
        { service: 'db', status: 'down', latency: null, lastChecked: Date.now(), message: 'err' },
      ];

      expect(aggregateHealth(results)).toBe('down');
    });

    it('returns unknown for empty results', () => {
      expect(aggregateHealth([])).toBe('unknown');
    });

    it('returns degraded when mix of healthy and degraded', () => {
      const results: HealthCheckResult[] = [
        { service: 'api', status: 'healthy', latency: 50, lastChecked: Date.now(), message: null },
        { service: 'db', status: 'degraded', latency: 200, lastChecked: Date.now(), message: 'slow' },
      ];

      expect(aggregateHealth(results)).toBe('degraded');
    });
  });

  describe('createHealthMonitor', () => {
    it('returns null for getLastResults before start', () => {
      const monitor = createHealthMonitor(60000);

      expect(monitor.getLastResults()).toBeNull();

      monitor.stop();
    });

    it('provides an onStatusChange unsubscribe function', () => {
      const monitor = createHealthMonitor(60000);
      const callback = vi.fn();

      const unsubscribe = monitor.onStatusChange(callback);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      monitor.stop();
    });

    it('stop is safe to call without start', () => {
      const monitor = createHealthMonitor(60000);

      expect(() => monitor.stop()).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// Usage Metrics Tests
// ---------------------------------------------------------------------------

describe('usage-metrics', () => {
  let tracker: UsageTracker;

  beforeEach(() => {
    tracker = createUsageTracker();
  });

  describe('trackFeatureUse', () => {
    it('tracks a new feature with count 1', () => {
      tracker.trackFeatureUse('spec-create');

      const metrics = tracker.getMetrics();

      expect(metrics['spec-create']).toBeDefined();
      expect(metrics['spec-create'].count).toBe(1);
    });

    it('increments count for repeated feature use', () => {
      tracker.trackFeatureUse('spec-create');
      tracker.trackFeatureUse('spec-create');
      tracker.trackFeatureUse('spec-create');

      const metrics = tracker.getMetrics();

      expect(metrics['spec-create'].count).toBe(3);
    });

    it('tracks duration on first use', () => {
      tracker.trackFeatureUse('ai-generate', 500);

      const metrics = tracker.getMetrics();

      expect(metrics['ai-generate'].averageDuration).toBe(500);
    });

    it('calculates average duration across uses', () => {
      tracker.trackFeatureUse('ai-generate', 200);
      tracker.trackFeatureUse('ai-generate', 400);

      const metrics = tracker.getMetrics();

      expect(metrics['ai-generate'].averageDuration).toBe(300);
    });

    it('sets averageDuration to null when no duration provided', () => {
      tracker.trackFeatureUse('spec-edit');

      const metrics = tracker.getMetrics();

      expect(metrics['spec-edit'].averageDuration).toBeNull();
    });

    it('keeps averageDuration null if no durations ever provided', () => {
      tracker.trackFeatureUse('spec-edit');
      tracker.trackFeatureUse('spec-edit');

      const metrics = tracker.getMetrics();

      expect(metrics['spec-edit'].averageDuration).toBeNull();
    });

    it('updates lastUsed timestamp', () => {
      const before = Date.now();
      tracker.trackFeatureUse('spec-delete');
      const after = Date.now();

      const metrics = tracker.getMetrics();

      expect(metrics['spec-delete'].lastUsed).toBeGreaterThanOrEqual(before);
      expect(metrics['spec-delete'].lastUsed).toBeLessThanOrEqual(after);
    });

    it('tracks multiple different features independently', () => {
      tracker.trackFeatureUse('spec-create');
      tracker.trackFeatureUse('spec-edit');
      tracker.trackFeatureUse('ai-generate');

      const metrics = tracker.getMetrics();

      expect(Object.keys(metrics)).toHaveLength(3);
      expect(metrics['spec-create'].count).toBe(1);
      expect(metrics['spec-edit'].count).toBe(1);
      expect(metrics['ai-generate'].count).toBe(1);
    });
  });

  describe('trackPageView', () => {
    it('increments page view count', () => {
      tracker.trackPageView('/dashboard');
      tracker.trackPageView('/specs');

      const summary = tracker.getSummary();

      expect(summary.pageViews).toBe(2);
    });

    it('starts with zero page views', () => {
      const summary = tracker.getSummary();

      expect(summary.pageViews).toBe(0);
    });
  });

  describe('getTopFeatures', () => {
    it('returns features sorted by count descending', () => {
      tracker.trackFeatureUse('low');
      tracker.trackFeatureUse('high');
      tracker.trackFeatureUse('high');
      tracker.trackFeatureUse('high');
      tracker.trackFeatureUse('medium');
      tracker.trackFeatureUse('medium');

      const top = tracker.getTopFeatures();

      expect(top[0].feature).toBe('high');
      expect(top[0].count).toBe(3);
      expect(top[1].feature).toBe('medium');
      expect(top[1].count).toBe(2);
      expect(top[2].feature).toBe('low');
      expect(top[2].count).toBe(1);
    });

    it('respects the limit parameter', () => {
      tracker.trackFeatureUse('a');
      tracker.trackFeatureUse('b');
      tracker.trackFeatureUse('c');

      const top = tracker.getTopFeatures(2);

      expect(top).toHaveLength(2);
    });

    it('returns empty array when no features tracked', () => {
      const top = tracker.getTopFeatures();

      expect(top).toHaveLength(0);
    });
  });

  describe('getSessionDuration', () => {
    it('returns a positive number', () => {
      const duration = tracker.getSessionDuration();

      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSummary', () => {
    it('returns correct totals', () => {
      tracker.trackFeatureUse('spec-create');
      tracker.trackFeatureUse('spec-create');
      tracker.trackFeatureUse('spec-edit');
      tracker.trackPageView('/home');

      const summary = tracker.getSummary();

      expect(summary.totalFeatureUses).toBe(3);
      expect(summary.uniqueFeatures).toBe(2);
      expect(summary.pageViews).toBe(1);
      expect(summary.sessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('returns zeroes when nothing tracked', () => {
      const summary = tracker.getSummary();

      expect(summary.totalFeatureUses).toBe(0);
      expect(summary.uniqueFeatures).toBe(0);
      expect(summary.pageViews).toBe(0);
    });
  });

  describe('TRACKED_FEATURES', () => {
    it('contains spec-create', () => {
      expect(TRACKED_FEATURES).toContain('spec-create');
    });

    it('contains spec-edit', () => {
      expect(TRACKED_FEATURES).toContain('spec-edit');
    });

    it('contains spec-delete', () => {
      expect(TRACKED_FEATURES).toContain('spec-delete');
    });

    it('contains ai-generate', () => {
      expect(TRACKED_FEATURES).toContain('ai-generate');
    });

    it('contains export-markdown', () => {
      expect(TRACKED_FEATURES).toContain('export-markdown');
    });

    it('contains export-json', () => {
      expect(TRACKED_FEATURES).toContain('export-json');
    });

    it('contains export-cursor', () => {
      expect(TRACKED_FEATURES).toContain('export-cursor');
    });

    it('contains export-copilot', () => {
      expect(TRACKED_FEATURES).toContain('export-copilot');
    });

    it('contains export-devin', () => {
      expect(TRACKED_FEATURES).toContain('export-devin');
    });

    it('contains collaboration-comment', () => {
      expect(TRACKED_FEATURES).toContain('collaboration-comment');
    });

    it('contains github-sync', () => {
      expect(TRACKED_FEATURES).toContain('github-sync');
    });

    it('contains webhook-create', () => {
      expect(TRACKED_FEATURES).toContain('webhook-create');
    });

    it('has exactly 12 tracked features', () => {
      expect(TRACKED_FEATURES).toHaveLength(12);
    });
  });
});

// ---------------------------------------------------------------------------
// Uptime Tracker Tests
// ---------------------------------------------------------------------------

describe('uptime-tracker', () => {
  let tracker: UptimeTracker;

  beforeEach(() => {
    tracker = createUptimeTracker();
  });

  describe('recordCheck', () => {
    it('stores a successful check record', () => {
      tracker.recordCheck(true, 50);

      const records = tracker.getRecords();

      expect(records).toHaveLength(1);
      expect(records[0].isUp).toBe(true);
      expect(records[0].latency).toBe(50);
    });

    it('stores a failed check record', () => {
      tracker.recordCheck(false);

      const records = tracker.getRecords();

      expect(records).toHaveLength(1);
      expect(records[0].isUp).toBe(false);
      expect(records[0].latency).toBeNull();
    });

    it('stores multiple records in order', () => {
      tracker.recordCheck(true, 10);
      tracker.recordCheck(false);
      tracker.recordCheck(true, 20);

      const records = tracker.getRecords();

      expect(records).toHaveLength(3);
      expect(records[0].isUp).toBe(true);
      expect(records[1].isUp).toBe(false);
      expect(records[2].isUp).toBe(true);
    });

    it('sets timestamp on each record', () => {
      const before = Date.now();
      tracker.recordCheck(true, 100);
      const after = Date.now();

      const records = tracker.getRecords();

      expect(records[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(records[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('getStats', () => {
    it('calculates correct uptime percentage', () => {
      tracker.recordCheck(true, 50);
      tracker.recordCheck(true, 60);
      tracker.recordCheck(false);
      tracker.recordCheck(true, 40);

      const stats = tracker.getStats();

      expect(stats.uptimePercentage).toBe(75);
      expect(stats.totalChecks).toBe(4);
      expect(stats.successfulChecks).toBe(3);
    });

    it('calculates correct average latency', () => {
      tracker.recordCheck(true, 100);
      tracker.recordCheck(true, 200);
      tracker.recordCheck(true, 300);

      const stats = tracker.getStats();

      expect(stats.averageLatency).toBe(200);
    });

    it('calculates correct max and min latency', () => {
      tracker.recordCheck(true, 50);
      tracker.recordCheck(true, 200);
      tracker.recordCheck(true, 100);

      const stats = tracker.getStats();

      expect(stats.maxLatency).toBe(200);
      expect(stats.minLatency).toBe(50);
    });

    it('returns zero stats when no records exist', () => {
      const stats = tracker.getStats();

      expect(stats.uptimePercentage).toBe(0);
      expect(stats.totalChecks).toBe(0);
      expect(stats.successfulChecks).toBe(0);
      expect(stats.averageLatency).toBe(0);
      expect(stats.maxLatency).toBe(0);
      expect(stats.minLatency).toBe(0);
    });

    it('handles records without latency in averages', () => {
      tracker.recordCheck(true, 100);
      tracker.recordCheck(false); // no latency
      tracker.recordCheck(true, 200);

      const stats = tracker.getStats();

      // Only two latency values: (100 + 200) / 2 = 150
      expect(stats.averageLatency).toBe(150);
    });

    it('returns 100% uptime when all checks succeed', () => {
      tracker.recordCheck(true, 10);
      tracker.recordCheck(true, 20);
      tracker.recordCheck(true, 30);

      const stats = tracker.getStats();

      expect(stats.uptimePercentage).toBe(100);
    });

    it('returns 0% uptime when all checks fail', () => {
      tracker.recordCheck(false);
      tracker.recordCheck(false);

      const stats = tracker.getStats();

      expect(stats.uptimePercentage).toBe(0);
    });
  });

  describe('getRecentRecords', () => {
    it('returns the last N records', () => {
      tracker.recordCheck(true, 10);
      tracker.recordCheck(true, 20);
      tracker.recordCheck(true, 30);
      tracker.recordCheck(true, 40);

      const recent = tracker.getRecentRecords(2);

      expect(recent).toHaveLength(2);
      expect(recent[0].latency).toBe(30);
      expect(recent[1].latency).toBe(40);
    });

    it('returns all records if count exceeds total', () => {
      tracker.recordCheck(true, 10);

      const recent = tracker.getRecentRecords(100);

      expect(recent).toHaveLength(1);
    });
  });

  describe('isCurrentlyUp', () => {
    it('returns true when last record is up', () => {
      tracker.recordCheck(false);
      tracker.recordCheck(true, 50);

      expect(tracker.isCurrentlyUp()).toBe(true);
    });

    it('returns false when last record is down', () => {
      tracker.recordCheck(true, 50);
      tracker.recordCheck(false);

      expect(tracker.isCurrentlyUp()).toBe(false);
    });

    it('returns false when no records exist', () => {
      expect(tracker.isCurrentlyUp()).toBe(false);
    });
  });

  describe('formatUptime', () => {
    it('formats 99.95 correctly', () => {
      expect(formatUptime(99.95)).toBe('99.95%');
    });

    it('formats 100 correctly', () => {
      expect(formatUptime(100)).toBe('100.00%');
    });

    it('formats 0 correctly', () => {
      expect(formatUptime(0)).toBe('0.00%');
    });

    it('formats with two decimal places', () => {
      expect(formatUptime(99.999)).toBe('100.00%');
    });

    it('formats partial percentage', () => {
      expect(formatUptime(50.5)).toBe('50.50%');
    });
  });

  describe('getUptimeColor', () => {
    it('returns green for percentage above 99.9', () => {
      expect(getUptimeColor(99.95)).toBe('#22c55e');
    });

    it('returns green for 100%', () => {
      expect(getUptimeColor(100)).toBe('#22c55e');
    });

    it('returns yellow for percentage between 99 and 99.9', () => {
      expect(getUptimeColor(99.5)).toBe('#eab308');
    });

    it('returns yellow for exactly 99.9', () => {
      expect(getUptimeColor(99.9)).toBe('#eab308');
    });

    it('returns red for percentage below 99', () => {
      expect(getUptimeColor(98)).toBe('#ef4444');
    });

    it('returns red for exactly 99', () => {
      expect(getUptimeColor(99)).toBe('#ef4444');
    });

    it('returns red for 0%', () => {
      expect(getUptimeColor(0)).toBe('#ef4444');
    });
  });
});
