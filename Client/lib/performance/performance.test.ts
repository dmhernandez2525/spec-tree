/**
 * Comprehensive tests for all performance optimization modules.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// virtual-tree
import {
  flattenTree,
  getVisibleRange,
  calculateItemPosition,
  estimateTreeHeight,
  ITEM_HEIGHT,
  type HierarchicalNode,
} from './virtual-tree';

// cache
import { createCache } from './cache';

// request-dedup
import { createRequestDeduplicator } from './request-dedup';

// optimistic-updates
import { createOptimisticManager } from './optimistic-updates';

// web-vitals
import { rateMetric } from './web-vitals';

// bundle-analyzer
import {
  checkBundleSize,
  formatBytes,
  calculateCompressionRatio,
  type BundleStats,
} from './bundle-analyzer';

// service-worker
import { registerServiceWorker, isOffline, onOnlineStatusChange } from './service-worker';

// image-optimizer
import {
  shouldOptimize,
  estimateCompressedSize,
  DEFAULT_OPTIONS,
} from './image-optimizer';

// memory-monitor
import {
  analyzeSnapshots,
  formatMemorySize,
  type MemorySnapshot,
} from './memory-monitor';

// ---------------------------------------------------------------------------
// virtual-tree.ts
// ---------------------------------------------------------------------------
describe('virtual-tree', () => {
  const sampleTree: HierarchicalNode[] = [
    {
      id: 'epic-1',
      label: 'Epic 1',
      type: 'epic',
      children: [
        {
          id: 'feature-1',
          label: 'Feature 1',
          type: 'feature',
          children: [
            { id: 'story-1', label: 'Story 1', type: 'user-story' },
            { id: 'story-2', label: 'Story 2', type: 'user-story' },
          ],
        },
        { id: 'feature-2', label: 'Feature 2', type: 'feature' },
      ],
    },
    { id: 'epic-2', label: 'Epic 2', type: 'epic' },
  ];

  it('flattenTree returns correct flat list when all nodes are expanded', () => {
    const expanded = new Set(['epic-1', 'feature-1']);
    const flat = flattenTree(sampleTree, expanded);

    expect(flat.map((n) => n.id)).toEqual([
      'epic-1',
      'feature-1',
      'story-1',
      'story-2',
      'feature-2',
      'epic-2',
    ]);
  });

  it('flattenTree respects expanded state', () => {
    // Only epic-1 expanded, not feature-1
    const expanded = new Set(['epic-1']);
    const flat = flattenTree(sampleTree, expanded);

    expect(flat.map((n) => n.id)).toEqual([
      'epic-1',
      'feature-1',
      'feature-2',
      'epic-2',
    ]);
  });

  it('flattenTree returns only root nodes when nothing is expanded', () => {
    const expanded = new Set<string>();
    const flat = flattenTree(sampleTree, expanded);

    expect(flat).toHaveLength(2);
    expect(flat[0].id).toBe('epic-1');
    expect(flat[1].id).toBe('epic-2');
  });

  it('getVisibleRange calculates correct range with overscan', () => {
    // 100 items, scrolled 360px (10 items down), container 180px (5 items)
    const range = getVisibleRange(360, 180, 100);

    // firstVisible = 10, visibleCount = 5, overscan = 5
    // startIndex = max(0, 10 - 5) = 5
    // endIndex = min(99, 10 + 5 + 5) = 20
    expect(range.startIndex).toBe(5);
    expect(range.endIndex).toBe(20);
  });

  it('getVisibleRange clamps to 0 at the top', () => {
    const range = getVisibleRange(0, 180, 100);

    expect(range.startIndex).toBe(0);
  });

  it('getVisibleRange clamps to itemCount - 1 at the bottom', () => {
    const range = getVisibleRange(5000, 180, 50);

    expect(range.endIndex).toBe(49);
  });

  it('calculateItemPosition returns correct position', () => {
    const position = calculateItemPosition(7);

    expect(position.top).toBe(7 * ITEM_HEIGHT);
    expect(position.height).toBe(ITEM_HEIGHT);
  });

  it('estimateTreeHeight multiplies correctly', () => {
    expect(estimateTreeHeight(25)).toBe(25 * ITEM_HEIGHT);
    expect(estimateTreeHeight(0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// cache.ts
// ---------------------------------------------------------------------------
describe('cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('get returns data for valid entry', () => {
    const cache = createCache<string>();
    cache.set('key1', 'value1');

    expect(cache.get('key1')).toBe('value1');
  });

  it('get returns null for expired entry', () => {
    const cache = createCache<string>({ defaultTtl: 1000 });
    cache.set('key1', 'value1');

    vi.advanceTimersByTime(2000);

    expect(cache.get('key1')).toBeNull();
  });

  it('set evicts oldest when at maxSize', () => {
    const cache = createCache<string>({ maxSize: 2 });
    cache.set('first', 'a');

    vi.advanceTimersByTime(10);
    cache.set('second', 'b');

    vi.advanceTimersByTime(10);
    cache.set('third', 'c');

    // 'first' should have been evicted
    expect(cache.get('first')).toBeNull();
    expect(cache.get('second')).toBe('b');
    expect(cache.get('third')).toBe('c');
  });

  it('invalidatePattern removes matching keys', () => {
    const cache = createCache<string>();
    cache.set('user:1', 'Alice');
    cache.set('user:2', 'Bob');
    cache.set('post:1', 'Hello');

    cache.invalidatePattern(/^user:/);

    expect(cache.get('user:1')).toBeNull();
    expect(cache.get('user:2')).toBeNull();
    expect(cache.get('post:1')).toBe('Hello');
  });

  it('getStats returns correct hit/miss rates', () => {
    const cache = createCache<string>();
    cache.set('key1', 'value1');

    cache.get('key1'); // hit
    cache.get('key1'); // hit
    cache.get('missing'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(2 / 3);
  });

  it('clear removes all entries', () => {
    const cache = createCache<string>();
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');

    cache.clear();

    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
    expect(cache.get('c')).toBeNull();
  });

  it('has returns true for valid entries and false for expired ones', () => {
    const cache = createCache<string>({ defaultTtl: 1000 });
    cache.set('key1', 'value1');

    expect(cache.has('key1')).toBe(true);

    vi.advanceTimersByTime(2000);

    expect(cache.has('key1')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// request-dedup.ts
// ---------------------------------------------------------------------------
describe('request-dedup', () => {
  it('returns same promise for duplicate requests', async () => {
    const dedup = createRequestDeduplicator();
    let callCount = 0;

    const requestFn = () => {
      callCount++;
      return Promise.resolve('result');
    };

    const promise1 = dedup.dedupe('key', requestFn);
    const promise2 = dedup.dedupe('key', requestFn);

    expect(promise1).toBe(promise2);
    expect(callCount).toBe(1);

    await promise1;
  });

  it('creates new request after previous settles', async () => {
    const dedup = createRequestDeduplicator();
    let callCount = 0;

    const requestFn = () => {
      callCount++;
      return Promise.resolve(`result-${callCount}`);
    };

    const result1 = await dedup.dedupe('key', requestFn);
    const result2 = await dedup.dedupe('key', requestFn);

    expect(result1).toBe('result-1');
    expect(result2).toBe('result-2');
    expect(callCount).toBe(2);
  });

  it('getPendingCount tracks in-flight requests', () => {
    const dedup = createRequestDeduplicator();

    expect(dedup.getPendingCount()).toBe(0);

    // Create a promise that won't resolve immediately
    let resolvePromise: (value: string) => void = () => {};
    const requestFn = () =>
      new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

    dedup.dedupe('key1', requestFn);

    expect(dedup.getPendingCount()).toBe(1);

    resolvePromise('done');
  });

  it('clear removes all pending entries', () => {
    const dedup = createRequestDeduplicator();

    dedup.dedupe('key1', () => new Promise(() => {}));
    dedup.dedupe('key2', () => new Promise(() => {}));

    expect(dedup.getPendingCount()).toBe(2);

    dedup.clear();

    expect(dedup.getPendingCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// optimistic-updates.ts
// ---------------------------------------------------------------------------
describe('optimistic-updates', () => {
  it('apply returns optimistic state', () => {
    const manager = createOptimisticManager<string>();
    const result = manager.apply('update-1', 'old-value', 'new-value');

    expect(result).toBe('new-value');
  });

  it('rollback returns previous state', () => {
    const manager = createOptimisticManager<string>();
    manager.apply('update-1', 'old-value', 'new-value');

    const rolled = manager.rollback('update-1');
    expect(rolled).toBe('old-value');
  });

  it('rollback returns null for unknown id', () => {
    const manager = createOptimisticManager<string>();
    expect(manager.rollback('nonexistent')).toBeNull();
  });

  it('commit removes from pending', () => {
    const manager = createOptimisticManager<string>();
    manager.apply('update-1', 'old', 'new');

    expect(manager.hasPending()).toBe(true);

    manager.commit('update-1');

    expect(manager.hasPending()).toBe(false);
  });

  it('hasPending returns correct boolean', () => {
    const manager = createOptimisticManager<number>();

    expect(manager.hasPending()).toBe(false);

    manager.apply('u1', 1, 2);
    expect(manager.hasPending()).toBe(true);

    manager.commit('u1');
    expect(manager.hasPending()).toBe(false);
  });

  it('getPending lists only pending updates', () => {
    const manager = createOptimisticManager<string>();
    manager.apply('u1', 'a', 'b');
    manager.apply('u2', 'c', 'd');
    manager.commit('u1');

    const pending = manager.getPending();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('u2');
  });
});

// ---------------------------------------------------------------------------
// web-vitals.ts
// ---------------------------------------------------------------------------
describe('web-vitals', () => {
  it('rateMetric returns good for LCP under 2500', () => {
    expect(rateMetric('LCP', 2000)).toBe('good');
  });

  it('rateMetric returns good for LCP at exactly 2500', () => {
    expect(rateMetric('LCP', 2500)).toBe('good');
  });

  it('rateMetric returns needs-improvement for LCP between 2500 and 4000', () => {
    expect(rateMetric('LCP', 3000)).toBe('needs-improvement');
  });

  it('rateMetric returns poor for LCP over 4000', () => {
    expect(rateMetric('LCP', 5000)).toBe('poor');
  });

  it('rateMetric returns good for CLS under 0.1', () => {
    expect(rateMetric('CLS', 0.05)).toBe('good');
  });

  it('rateMetric returns poor for FID over 300', () => {
    expect(rateMetric('FID', 500)).toBe('poor');
  });
});

// ---------------------------------------------------------------------------
// bundle-analyzer.ts
// ---------------------------------------------------------------------------
describe('bundle-analyzer', () => {
  it('checkBundleSize warns when total exceeds limit', () => {
    const stats: BundleStats = {
      totalSize: 600_000,
      routeChunks: new Map(),
      sharedChunks: new Map(),
    };

    const warnings = checkBundleSize(stats);

    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings.some((w) => w.type === 'total')).toBe(true);
  });

  it('checkBundleSize returns no warnings for small bundles', () => {
    const stats: BundleStats = {
      totalSize: 100_000,
      routeChunks: new Map([['home', 50_000]]),
      sharedChunks: new Map([['vendor', 80_000]]),
    };

    const warnings = checkBundleSize(stats);
    expect(warnings).toHaveLength(0);
  });

  it('checkBundleSize warns when a route chunk exceeds per-route limit', () => {
    const stats: BundleStats = {
      totalSize: 200_000,
      routeChunks: new Map([['dashboard', 200_000]]),
      sharedChunks: new Map(),
    };

    const warnings = checkBundleSize(stats);
    expect(warnings.some((w) => w.type === 'route')).toBe(true);
  });

  it('formatBytes converts bytes correctly', () => {
    expect(formatBytes(500)).toBe('500 B');
  });

  it('formatBytes converts kilobytes correctly', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formatBytes converts megabytes correctly', () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  it('calculateCompressionRatio returns correct percentage', () => {
    // 1000 original, 300 compressed = 70% compression
    expect(calculateCompressionRatio(1000, 300)).toBe(70);
  });

  it('calculateCompressionRatio returns 0 for zero original size', () => {
    expect(calculateCompressionRatio(0, 100)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// service-worker.ts
// ---------------------------------------------------------------------------
describe('service-worker', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('registerServiceWorker returns null when unsupported', async () => {
    // Remove serviceWorker from navigator
    vi.stubGlobal('navigator', {});

    const result = await registerServiceWorker();
    expect(result).toBeNull();
  });

  it('registerServiceWorker calls navigator.serviceWorker.register', async () => {
    const mockRegistration = { scope: '/' };
    const registerMock = vi.fn().mockResolvedValue(mockRegistration);

    vi.stubGlobal('navigator', {
      serviceWorker: { register: registerMock },
    });

    const result = await registerServiceWorker('/custom-sw.js');

    expect(registerMock).toHaveBeenCalledWith('/custom-sw.js');
    expect(result).toBe(mockRegistration);
  });

  it('registerServiceWorker returns null on registration error', async () => {
    const registerMock = vi.fn().mockRejectedValue(new Error('Registration failed'));

    vi.stubGlobal('navigator', {
      serviceWorker: { register: registerMock },
    });

    const result = await registerServiceWorker();
    expect(result).toBeNull();
  });

  it('isOffline returns correct value when online', () => {
    vi.stubGlobal('navigator', { onLine: true });
    expect(isOffline()).toBe(false);
  });

  it('isOffline returns correct value when offline', () => {
    vi.stubGlobal('navigator', { onLine: false });
    expect(isOffline()).toBe(true);
  });

  it('onOnlineStatusChange registers and cleans up listeners', () => {
    const addSpy = vi.fn();
    const removeSpy = vi.fn();

    vi.stubGlobal('window', {
      addEventListener: addSpy,
      removeEventListener: removeSpy,
    });

    const callback = vi.fn();
    const cleanup = onOnlineStatusChange(callback);

    expect(addSpy).toHaveBeenCalledTimes(2);
    expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    cleanup();

    expect(removeSpy).toHaveBeenCalledTimes(2);
    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

// ---------------------------------------------------------------------------
// image-optimizer.ts
// ---------------------------------------------------------------------------
describe('image-optimizer', () => {
  it('shouldOptimize returns true for large files', () => {
    const largeFile = new File(['x'.repeat(200_000)], 'photo.png', {
      type: 'image/png',
    });
    expect(shouldOptimize(largeFile)).toBe(true);
  });

  it('shouldOptimize returns false for small files', () => {
    const smallFile = new File(['x'.repeat(50_000)], 'icon.png', {
      type: 'image/png',
    });
    expect(shouldOptimize(smallFile)).toBe(false);
  });

  it('shouldOptimize respects custom threshold', () => {
    const file = new File(['x'.repeat(60_000)], 'medium.png', {
      type: 'image/png',
    });
    expect(shouldOptimize(file, 50_000)).toBe(true);
    expect(shouldOptimize(file, 100_000)).toBe(false);
  });

  it('estimateCompressedSize returns smaller value for webp', () => {
    const original = 1_000_000;
    const estimated = estimateCompressedSize(original, 'webp');

    expect(estimated).toBeLessThan(original);
    expect(estimated).toBeGreaterThan(0);
  });

  it('estimateCompressedSize returns smaller value for avif', () => {
    const original = 500_000;
    const estimated = estimateCompressedSize(original, 'avif');

    expect(estimated).toBeLessThan(original);
  });

  it('estimateCompressedSize returns proportional value for jpeg', () => {
    const original = 1_000_000;
    const estimated = estimateCompressedSize(original, 'jpeg');

    // jpeg ratio is 0.45, so ~450000
    expect(estimated).toBe(450_000);
  });

  it('DEFAULT_OPTIONS has expected values', () => {
    expect(DEFAULT_OPTIONS.maxWidth).toBe(1920);
    expect(DEFAULT_OPTIONS.maxHeight).toBe(1080);
    expect(DEFAULT_OPTIONS.quality).toBe(0.8);
    expect(DEFAULT_OPTIONS.format).toBe('webp');
  });
});

// ---------------------------------------------------------------------------
// memory-monitor.ts
// ---------------------------------------------------------------------------
describe('memory-monitor', () => {
  it('analyzeSnapshots detects stable trend', () => {
    const now = Date.now();
    const snapshots: MemorySnapshot[] = [
      { timestamp: now, usedJSHeapSize: 10_000_000, totalJSHeapSize: 20_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 30_000, usedJSHeapSize: 10_000_100, totalJSHeapSize: 20_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 60_000, usedJSHeapSize: 10_000_200, totalJSHeapSize: 20_000_000, jsHeapSizeLimit: 50_000_000 },
    ];

    const result = analyzeSnapshots(snapshots);

    expect(result.trend).toBe('stable');
    expect(result.leakSuspected).toBe(false);
  });

  it('analyzeSnapshots detects growing trend', () => {
    const now = Date.now();
    // Growth of 5 MB over 60 seconds = ~85 KB/s, well above 1 KB/s threshold
    const snapshots: MemorySnapshot[] = [
      { timestamp: now, usedJSHeapSize: 10_000_000, totalJSHeapSize: 20_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 30_000, usedJSHeapSize: 12_500_000, totalJSHeapSize: 22_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 60_000, usedJSHeapSize: 15_000_000, totalJSHeapSize: 25_000_000, jsHeapSizeLimit: 50_000_000 },
    ];

    const result = analyzeSnapshots(snapshots);

    expect(result.trend).toBe('growing');
  });

  it('analyzeSnapshots detects shrinking trend', () => {
    const now = Date.now();
    const snapshots: MemorySnapshot[] = [
      { timestamp: now, usedJSHeapSize: 20_000_000, totalJSHeapSize: 30_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 30_000, usedJSHeapSize: 17_000_000, totalJSHeapSize: 27_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 60_000, usedJSHeapSize: 14_000_000, totalJSHeapSize: 24_000_000, jsHeapSizeLimit: 50_000_000 },
    ];

    const result = analyzeSnapshots(snapshots);

    expect(result.trend).toBe('shrinking');
  });

  it('analyzeSnapshots suspects leak with high growth over 5+ snapshots', () => {
    const now = Date.now();
    // Growth of ~20 MB over 5 minutes = ~68 KB/s, well above 1MB/min threshold (~17 KB/s)
    const snapshots: MemorySnapshot[] = Array.from({ length: 6 }, (_, i) => ({
      timestamp: now + i * 60_000,
      usedJSHeapSize: 10_000_000 + i * 4_000_000,
      totalJSHeapSize: 30_000_000,
      jsHeapSizeLimit: 50_000_000,
    }));

    const result = analyzeSnapshots(snapshots);

    expect(result.leakSuspected).toBe(true);
  });

  it('analyzeSnapshots does not suspect leak with fewer than 5 snapshots', () => {
    const now = Date.now();
    // High growth but only 3 snapshots
    const snapshots: MemorySnapshot[] = [
      { timestamp: now, usedJSHeapSize: 10_000_000, totalJSHeapSize: 20_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 60_000, usedJSHeapSize: 20_000_000, totalJSHeapSize: 30_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 120_000, usedJSHeapSize: 30_000_000, totalJSHeapSize: 40_000_000, jsHeapSizeLimit: 50_000_000 },
    ];

    const result = analyzeSnapshots(snapshots);

    expect(result.leakSuspected).toBe(false);
  });

  it('analyzeSnapshots returns correct peak usage', () => {
    const now = Date.now();
    const snapshots: MemorySnapshot[] = [
      { timestamp: now, usedJSHeapSize: 5_000_000, totalJSHeapSize: 10_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 30_000, usedJSHeapSize: 15_000_000, totalJSHeapSize: 20_000_000, jsHeapSizeLimit: 50_000_000 },
      { timestamp: now + 60_000, usedJSHeapSize: 8_000_000, totalJSHeapSize: 15_000_000, jsHeapSizeLimit: 50_000_000 },
    ];

    const result = analyzeSnapshots(snapshots);

    expect(result.peakUsage).toBe(15_000_000);
  });

  it('analyzeSnapshots handles empty array', () => {
    const result = analyzeSnapshots([]);

    expect(result.trend).toBe('stable');
    expect(result.averageGrowthRate).toBe(0);
    expect(result.peakUsage).toBe(0);
    expect(result.leakSuspected).toBe(false);
  });

  it('formatMemorySize formats bytes correctly', () => {
    expect(formatMemorySize(500)).toBe('500 B');
  });

  it('formatMemorySize formats kilobytes correctly', () => {
    expect(formatMemorySize(1024)).toBe('1.00 KB');
  });

  it('formatMemorySize formats megabytes correctly', () => {
    expect(formatMemorySize(1.5 * 1024 * 1024)).toBe('1.50 MB');
  });

  it('formatMemorySize formats gigabytes correctly', () => {
    expect(formatMemorySize(2 * 1024 * 1024 * 1024)).toBe('2.00 GB');
  });
});
