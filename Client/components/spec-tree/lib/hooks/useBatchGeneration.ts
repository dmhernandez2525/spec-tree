/**
 * Batch Generation Hook
 *
 * F1.1.17 - Batch generation
 *
 * Enables generating multiple work items in a single batch operation
 * with progress tracking, concurrency control, and error handling.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Work item type for batch generation
 */
export type BatchWorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Status of a single generation item
 */
export type BatchItemStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';

/**
 * Status of the entire batch
 */
export type BatchStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

/**
 * A single item in the batch
 */
export interface BatchItem<T = unknown> {
  /** Unique item ID */
  id: string;
  /** Type of work item to generate */
  type: BatchWorkItemType;
  /** Input data for generation (e.g., title, context, parent info) */
  input: T;
  /** Current status */
  status: BatchItemStatus;
  /** Generated result (if completed) */
  result?: string;
  /** Error message (if failed) */
  error?: string;
  /** Start time of generation */
  startTime?: number;
  /** End time of generation */
  endTime?: number;
  /** Number of retry attempts */
  retryCount: number;
}

/**
 * Batch progress information
 */
export interface BatchProgress {
  /** Total items in batch */
  total: number;
  /** Items completed successfully */
  completed: number;
  /** Items that failed */
  failed: number;
  /** Items currently generating */
  generating: number;
  /** Items pending */
  pending: number;
  /** Items cancelled */
  cancelled: number;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Estimated time remaining in ms */
  estimatedTimeRemaining: number | null;
  /** Average generation time per item in ms */
  averageGenerationTime: number | null;
}

/**
 * Batch statistics
 */
export interface BatchStatistics {
  /** Total processing time in ms */
  totalTime: number | null;
  /** Successful generations */
  successCount: number;
  /** Failed generations */
  failureCount: number;
  /** Cancellation count */
  cancelledCount: number;
  /** Average generation time in ms */
  averageTime: number | null;
  /** Fastest generation in ms */
  fastestTime: number | null;
  /** Slowest generation in ms */
  slowestTime: number | null;
  /** Success rate (0-1) */
  successRate: number;
}

/**
 * Generator function type for processing batch items
 */
export type BatchGenerator<T> = (
  item: BatchItem<T>,
  signal: AbortSignal
) => Promise<string>;

/**
 * Options for useBatchGeneration hook
 */
export interface UseBatchGenerationOptions<T> {
  /** Maximum concurrent generations (default: 3) */
  concurrency?: number;
  /** Generator function to process each item */
  generator?: BatchGenerator<T>;
  /** Maximum retry attempts for failed items (default: 2) */
  maxRetries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
  /** Delay between starting new items in ms (default: 100) */
  itemDelay?: number;
  /** Callback when an item completes */
  onItemComplete?: (item: BatchItem<T>) => void;
  /** Callback when an item fails */
  onItemError?: (item: BatchItem<T>, error: Error) => void;
  /** Callback when batch completes */
  onBatchComplete?: (items: BatchItem<T>[], stats: BatchStatistics) => void;
}

/**
 * Return type for useBatchGeneration hook
 */
export interface UseBatchGenerationReturn<T> {
  /** All items in the batch */
  items: BatchItem<T>[];
  /** Current batch status */
  status: BatchStatus;
  /** Progress information */
  progress: BatchProgress;
  /** Batch statistics */
  statistics: BatchStatistics;
  /** Start or resume batch generation */
  start: (items?: Array<Omit<BatchItem<T>, 'status' | 'retryCount'>>) => void;
  /** Pause batch generation */
  pause: () => void;
  /** Resume paused batch */
  resume: () => void;
  /** Cancel batch generation */
  cancel: () => void;
  /** Cancel a specific item */
  cancelItem: (itemId: string) => void;
  /** Retry failed items */
  retryFailed: () => void;
  /** Retry a specific item */
  retryItem: (itemId: string) => void;
  /** Reset the batch */
  reset: () => void;
  /** Add items to the batch */
  addItems: (items: Array<Omit<BatchItem<T>, 'status' | 'retryCount'>>) => void;
  /** Remove an item from the batch */
  removeItem: (itemId: string) => void;
  /** Get a specific item */
  getItem: (itemId: string) => BatchItem<T> | undefined;
  /** Check if batch is running */
  isRunning: boolean;
  /** Check if batch is paused */
  isPaused: boolean;
}

/**
 * Default concurrency limit
 */
const DEFAULT_CONCURRENCY = 3;

/**
 * Default max retries
 */
const DEFAULT_MAX_RETRIES = 2;

/**
 * Default retry delay
 */
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Default item delay
 */
const DEFAULT_ITEM_DELAY = 100;

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `batch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate progress from items
 */
function calculateProgress(items: BatchItem[]): BatchProgress {
  const total = items.length;
  const completed = items.filter((i) => i.status === 'completed').length;
  const failed = items.filter((i) => i.status === 'failed').length;
  const generating = items.filter((i) => i.status === 'generating').length;
  const cancelled = items.filter((i) => i.status === 'cancelled').length;
  const pending = items.filter((i) => i.status === 'pending').length;

  // Calculate average time from completed items
  const completedItems = items.filter((i) => i.status === 'completed' && i.startTime && i.endTime);
  const averageGenerationTime = completedItems.length > 0
    ? completedItems.reduce((sum, i) => sum + ((i.endTime || 0) - (i.startTime || 0)), 0) / completedItems.length
    : null;

  // Estimate remaining time
  const remainingItems = pending + generating;
  const estimatedTimeRemaining = averageGenerationTime && remainingItems > 0
    ? averageGenerationTime * remainingItems
    : null;

  return {
    total,
    completed,
    failed,
    generating,
    pending,
    cancelled,
    percentage: total > 0 ? Math.round(((completed + failed + cancelled) / total) * 100) : 0,
    estimatedTimeRemaining,
    averageGenerationTime,
  };
}

/**
 * Calculate statistics from items
 */
function calculateStatistics(items: BatchItem[], batchStartTime: number | null): BatchStatistics {
  const completedItems = items.filter((i) => i.status === 'completed' && i.startTime && i.endTime);
  const times = completedItems.map((i) => (i.endTime || 0) - (i.startTime || 0));

  const successCount = items.filter((i) => i.status === 'completed').length;
  const failureCount = items.filter((i) => i.status === 'failed').length;
  const cancelledCount = items.filter((i) => i.status === 'cancelled').length;
  const totalProcessed = successCount + failureCount;

  return {
    totalTime: batchStartTime ? Date.now() - batchStartTime : null,
    successCount,
    failureCount,
    cancelledCount,
    averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null,
    fastestTime: times.length > 0 ? Math.min(...times) : null,
    slowestTime: times.length > 0 ? Math.max(...times) : null,
    successRate: totalProcessed > 0 ? successCount / totalProcessed : 0,
  };
}

/**
 * Default generator that simulates generation
 */
async function defaultGenerator<T>(item: BatchItem<T>, signal: AbortSignal): Promise<string> {
  // Simulate generation time
  const delay = 500 + Math.random() * 1000;

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, delay);
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Cancelled'));
    });
  });

  if (signal.aborted) {
    throw new Error('Cancelled');
  }

  return `Generated content for ${item.type}: ${JSON.stringify(item.input)}`;
}

/**
 * Hook for batch generation of work items
 */
export function useBatchGeneration<T = unknown>(
  options: UseBatchGenerationOptions<T> = {}
): UseBatchGenerationReturn<T> {
  const {
    concurrency = DEFAULT_CONCURRENCY,
    generator = defaultGenerator,
    maxRetries = DEFAULT_MAX_RETRIES,
    // retryDelay reserved for future exponential backoff implementation
    retryDelay: _retryDelay = DEFAULT_RETRY_DELAY,
    itemDelay = DEFAULT_ITEM_DELAY,
    onItemComplete,
    onItemError,
    onBatchComplete,
  } = options;

  const [items, setItems] = useState<BatchItem<T>[]>([]);
  const [status, setStatus] = useState<BatchStatus>('idle');
  const [batchStartTime, setBatchStartTime] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pausedRef = useRef<boolean>(false);
  const itemAbortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const generatorRef = useRef(generator);

  // Update generator ref when it changes
  useEffect(() => {
    generatorRef.current = generator;
  }, [generator]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      itemAbortControllersRef.current.forEach((controller) => controller.abort());
    };
  }, []);

  /**
   * Process a single item
   */
  const processItem = useCallback(
    async (item: BatchItem<T>, signal: AbortSignal): Promise<void> => {
      // Create item-specific abort controller
      const itemController = new AbortController();
      itemAbortControllersRef.current.set(item.id, itemController);

      // Link to main abort signal
      const combinedSignal = {
        get aborted() {
          return signal.aborted || itemController.signal.aborted;
        },
        addEventListener: (event: string, handler: () => void) => {
          signal.addEventListener(event, handler);
          itemController.signal.addEventListener(event, handler);
        },
        removeEventListener: (event: string, handler: () => void) => {
          signal.removeEventListener(event, handler);
          itemController.signal.removeEventListener(event, handler);
        },
      } as AbortSignal;

      // Update status to generating
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'generating' as BatchItemStatus, startTime: Date.now() }
            : i
        )
      );

      try {
        const result = await generatorRef.current(item, combinedSignal);

        if (combinedSignal.aborted) {
          throw new Error('Cancelled');
        }

        // Update with result
        const completedItem: BatchItem<T> = {
          ...item,
          status: 'completed',
          result,
          endTime: Date.now(),
        };

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? completedItem : i
          )
        );

        onItemComplete?.(completedItem);
      } catch (error) {
        if (combinedSignal.aborted || (error instanceof Error && error.message === 'Cancelled')) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: 'cancelled' as BatchItemStatus, endTime: Date.now() }
                : i
            )
          );
          return;
        }

        const err = error instanceof Error ? error : new Error('Unknown error');
        const failedItem: BatchItem<T> = {
          ...item,
          status: 'failed',
          error: err.message,
          endTime: Date.now(),
        };

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? failedItem : i
          )
        );

        onItemError?.(failedItem, err);
      } finally {
        itemAbortControllersRef.current.delete(item.id);
      }
    },
    [onItemComplete, onItemError]
  );

  /**
   * Process the batch with concurrency control
   */
  const processBatch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setStatus('running');
    setBatchStartTime(Date.now());

    const activePromises = new Map<string, Promise<void>>();

    while (true) {
      // Check for abort or pause
      if (signal.aborted) {
        break;
      }

      if (pausedRef.current) {
        setStatus('paused');
        // Wait for resume
        await new Promise<void>((resolve) => {
          const checkResume = () => {
            if (!pausedRef.current || signal.aborted) {
              resolve();
            } else {
              setTimeout(checkResume, 100);
            }
          };
          checkResume();
        });

        if (signal.aborted) {
          break;
        }

        setStatus('running');
      }

      // Get current items state
      const currentItems = await new Promise<BatchItem<T>[]>((resolve) => {
        setItems((prev) => {
          resolve([...prev]);
          return prev;
        });
      });

      // Check if all items are processed
      const pendingItems = currentItems.filter((i) => i.status === 'pending');

      if (pendingItems.length === 0 && activePromises.size === 0) {
        // All done
        break;
      }

      // Start new items up to concurrency limit
      while (activePromises.size < concurrency && pendingItems.length > 0) {
        const item = pendingItems.shift();
        if (!item) break;

        // Small delay between starting items
        if (itemDelay > 0) {
          await sleep(itemDelay);
        }

        const promise = processItem(item, signal).finally(() => {
          activePromises.delete(item.id);
        });

        activePromises.set(item.id, promise);
      }

      // Wait for at least one to complete
      if (activePromises.size > 0) {
        await Promise.race(Array.from(activePromises.values()));
      }
    }

    // Wait for all active promises to complete
    await Promise.all(Array.from(activePromises.values()));

    // Get final items state
    const finalItems = await new Promise<BatchItem<T>[]>((resolve) => {
      setItems((prev) => {
        resolve([...prev]);
        return prev;
      });
    });

    const finalStatus: BatchStatus = signal.aborted ? 'cancelled' : 'completed';
    setStatus(finalStatus);

    if (finalStatus === 'completed') {
      const stats = calculateStatistics(finalItems, batchStartTime);
      onBatchComplete?.(finalItems, stats);
    }
  }, [concurrency, itemDelay, processItem, batchStartTime, onBatchComplete]);

  /**
   * Start batch generation
   */
  const start = useCallback(
    (newItems?: Array<Omit<BatchItem<T>, 'status' | 'retryCount'>>) => {
      if (newItems) {
        const batchItems: BatchItem<T>[] = newItems.map((item) => ({
          ...item,
          id: item.id || generateId(),
          status: 'pending' as BatchItemStatus,
          retryCount: 0,
        }));
        setItems(batchItems);
      }

      pausedRef.current = false;
      processBatch();
    },
    [processBatch]
  );

  /**
   * Pause batch generation
   */
  const pause = useCallback(() => {
    pausedRef.current = true;
    setStatus('paused');
  }, []);

  /**
   * Resume batch generation
   */
  const resume = useCallback(() => {
    pausedRef.current = false;
    if (status === 'paused') {
      setStatus('running');
    }
  }, [status]);

  /**
   * Cancel batch generation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cancel all item-specific controllers
    itemAbortControllersRef.current.forEach((controller) => controller.abort());

    setItems((prev) =>
      prev.map((i) =>
        i.status === 'pending' || i.status === 'generating'
          ? { ...i, status: 'cancelled' as BatchItemStatus }
          : i
      )
    );

    setStatus('cancelled');
  }, []);

  /**
   * Cancel a specific item
   */
  const cancelItem = useCallback((itemId: string) => {
    const controller = itemAbortControllersRef.current.get(itemId);
    if (controller) {
      controller.abort();
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId && (i.status === 'pending' || i.status === 'generating')
          ? { ...i, status: 'cancelled' as BatchItemStatus }
          : i
      )
    );
  }, []);

  /**
   * Retry all failed items
   */
  const retryFailed = useCallback(() => {
    setItems((prev) =>
      prev.map((i) =>
        i.status === 'failed' && i.retryCount < maxRetries
          ? { ...i, status: 'pending' as BatchItemStatus, error: undefined, retryCount: i.retryCount + 1 }
          : i
      )
    );

    if (status === 'completed' || status === 'cancelled') {
      pausedRef.current = false;
      processBatch();
    }
  }, [status, maxRetries, processBatch]);

  /**
   * Retry a specific item
   */
  const retryItem = useCallback(
    (itemId: string) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId && i.status === 'failed' && i.retryCount < maxRetries
            ? { ...i, status: 'pending' as BatchItemStatus, error: undefined, retryCount: i.retryCount + 1 }
            : i
        )
      );

      if (status === 'completed' || status === 'cancelled') {
        pausedRef.current = false;
        processBatch();
      }
    },
    [status, maxRetries, processBatch]
  );

  /**
   * Reset the batch
   */
  const reset = useCallback(() => {
    cancel();
    setItems([]);
    setStatus('idle');
    setBatchStartTime(null);
  }, [cancel]);

  /**
   * Add items to the batch
   */
  const addItems = useCallback(
    (newItems: Array<Omit<BatchItem<T>, 'status' | 'retryCount'>>) => {
      const batchItems: BatchItem<T>[] = newItems.map((item) => ({
        ...item,
        id: item.id || generateId(),
        status: 'pending' as BatchItemStatus,
        retryCount: 0,
      }));

      setItems((prev) => [...prev, ...batchItems]);
    },
    []
  );

  /**
   * Remove an item from the batch
   */
  const removeItem = useCallback((itemId: string) => {
    // Cancel if generating
    cancelItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, [cancelItem]);

  /**
   * Get a specific item
   */
  const getItem = useCallback(
    (itemId: string): BatchItem<T> | undefined => {
      return items.find((i) => i.id === itemId);
    },
    [items]
  );

  // Calculate progress and statistics
  const progress = calculateProgress(items as BatchItem[]);
  const statistics = calculateStatistics(items as BatchItem[], batchStartTime);

  return {
    items,
    status,
    progress,
    statistics,
    start,
    pause,
    resume,
    cancel,
    cancelItem,
    retryFailed,
    retryItem,
    reset,
    addItems,
    removeItem,
    getItem,
    isRunning: status === 'running',
    isPaused: status === 'paused',
  };
}

/**
 * Get display name for batch item status
 */
export function getBatchItemStatusDisplayName(status: BatchItemStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'generating':
      return 'Generating';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * Get display name for batch status
 */
export function getBatchStatusDisplayName(status: BatchStatus): string {
  switch (status) {
    case 'idle':
      return 'Idle';
    case 'running':
      return 'Running';
    case 'paused':
      return 'Paused';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

/**
 * Create batch items from simple input
 */
export function createBatchItems<T>(
  inputs: T[],
  type: BatchWorkItemType
): Array<Omit<BatchItem<T>, 'status' | 'retryCount'>> {
  return inputs.map((input) => ({
    id: generateId(),
    type,
    input,
  }));
}

export default useBatchGeneration;
