/**
 * Generation result caching with TTL (time-to-live) support.
 * Provides an in-memory cache with automatic expiry, hit tracking,
 * and pattern-based invalidation for AI generation results.
 */

export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  ttl: number;
  hits: number;
}

export interface CacheOptions {
  /** Maximum number of entries before eviction. Default: 100 */
  maxSize: number;
  /** Default TTL in milliseconds. Default: 5 minutes */
  defaultTtl: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export interface Cache<T> {
  get: (key: string) => T | null;
  set: (key: string, data: T, ttl?: number) => void;
  has: (key: string) => boolean;
  invalidate: (key: string) => void;
  invalidatePattern: (pattern: RegExp) => void;
  clear: () => void;
  getStats: () => CacheStats;
}

const DEFAULT_OPTIONS: CacheOptions = {
  maxSize: 100,
  defaultTtl: 5 * 60 * 1000,
};

function isExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.createdAt > entry.ttl;
}

/**
 * Creates a new cache instance with configurable max size and TTL.
 * The cache tracks hit/miss statistics and automatically evicts
 * the oldest entry when the size limit is reached.
 */
export function createCache<T>(options?: Partial<CacheOptions>): Cache<T> {
  const config: CacheOptions = { ...DEFAULT_OPTIONS, ...options };
  const entries = new Map<string, CacheEntry<T>>();
  let totalHits = 0;
  let totalMisses = 0;

  function evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    entries.forEach((entry, key) => {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    });

    if (oldestKey !== null) {
      entries.delete(oldestKey);
    }
  }

  function get(key: string): T | null {
    const entry = entries.get(key);

    if (!entry) {
      totalMisses++;
      return null;
    }

    if (isExpired(entry)) {
      entries.delete(key);
      totalMisses++;
      return null;
    }

    entry.hits++;
    totalHits++;
    return entry.data;
  }

  function set(key: string, data: T, ttl?: number): void {
    if (entries.size >= config.maxSize && !entries.has(key)) {
      evictOldest();
    }

    entries.set(key, {
      data,
      createdAt: Date.now(),
      ttl: ttl ?? config.defaultTtl,
      hits: 0,
    });
  }

  function has(key: string): boolean {
    const entry = entries.get(key);

    if (!entry) {
      return false;
    }

    if (isExpired(entry)) {
      entries.delete(key);
      return false;
    }

    return true;
  }

  function invalidate(key: string): void {
    entries.delete(key);
  }

  function invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    entries.forEach((_entry, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => entries.delete(key));
  }

  function clear(): void {
    entries.clear();
  }

  function getStats(): CacheStats {
    const total = totalHits + totalMisses;
    return {
      size: entries.size,
      hits: totalHits,
      misses: totalMisses,
      hitRate: total > 0 ? totalHits / total : 0,
    };
  }

  return { get, set, has, invalidate, invalidatePattern, clear, getStats };
}
