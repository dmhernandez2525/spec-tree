/**
 * Request deduplication utilities.
 * Prevents duplicate API calls when multiple components request
 * the same data simultaneously by returning the same in-flight
 * promise for matching request keys.
 */

export interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export interface RequestDeduplicator {
  dedupe: <T>(key: string, requestFn: () => Promise<T>) => Promise<T>;
  getPendingCount: () => number;
  clear: () => void;
}

/**
 * Creates a request deduplicator that tracks in-flight requests by key.
 * If a request with the same key is already pending, the existing promise
 * is returned instead of initiating a new request. Once the request
 * settles (resolves or rejects), it is removed from tracking so
 * subsequent calls will trigger a fresh request.
 */
export function createRequestDeduplicator(): RequestDeduplicator {
  const pending = new Map<string, PendingRequest<unknown>>();

  function dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const existing = pending.get(key);
    if (existing) {
      return existing.promise as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      pending.delete(key);
    });

    pending.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  function getPendingCount(): number {
    return pending.size;
  }

  function clear(): void {
    pending.clear();
  }

  return { dedupe, getPendingCount, clear };
}
