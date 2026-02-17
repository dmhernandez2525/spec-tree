/**
 * Optimistic update utilities for instant UI feedback.
 * Allows the UI to reflect changes immediately while the server
 * request is in flight, with the ability to roll back to the
 * previous state if the request fails.
 */

export type OptimisticStatus = 'pending' | 'committed' | 'rolled-back';

export interface OptimisticUpdate<T> {
  id: string;
  previousState: T;
  optimisticState: T;
  timestamp: number;
  status: OptimisticStatus;
}

export interface OptimisticManager<T> {
  apply: (id: string, current: T, optimistic: T) => T;
  commit: (id: string) => void;
  rollback: (id: string) => T | null;
  getPending: () => OptimisticUpdate<T>[];
  hasPending: () => boolean;
}

/**
 * Creates a manager for tracking optimistic updates.
 * Each update stores both the previous and optimistic states,
 * allowing for clean rollback if the corresponding server
 * request fails.
 */
export function createOptimisticManager<T>(): OptimisticManager<T> {
  const updates = new Map<string, OptimisticUpdate<T>>();

  function apply(id: string, current: T, optimistic: T): T {
    updates.set(id, {
      id,
      previousState: current,
      optimisticState: optimistic,
      timestamp: Date.now(),
      status: 'pending',
    });

    return optimistic;
  }

  function commit(id: string): void {
    const update = updates.get(id);
    if (update) {
      update.status = 'committed';
      updates.delete(id);
    }
  }

  function rollback(id: string): T | null {
    const update = updates.get(id);
    if (!update) {
      return null;
    }

    update.status = 'rolled-back';
    const { previousState } = update;
    updates.delete(id);

    return previousState;
  }

  function getPending(): OptimisticUpdate<T>[] {
    return Array.from(updates.values()).filter(
      (update) => update.status === 'pending'
    );
  }

  function hasPending(): boolean {
    return getPending().length > 0;
  }

  return { apply, commit, rollback, getPending, hasPending };
}
