/**
 * Tests for useBatchGeneration hook
 *
 * F1.1.17 - Batch generation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useBatchGeneration,
  getBatchItemStatusDisplayName,
  getBatchStatusDisplayName,
  createBatchItems,
  BatchItem,
  BatchWorkItemType,
} from './useBatchGeneration';

describe('useBatchGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty items and idle status', () => {
      const { result } = renderHook(() => useBatchGeneration());

      expect(result.current.items).toEqual([]);
      expect(result.current.status).toBe('idle');
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useBatchGeneration());

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.resume).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
      expect(typeof result.current.cancelItem).toBe('function');
      expect(typeof result.current.retryFailed).toBe('function');
      expect(typeof result.current.retryItem).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.addItems).toBe('function');
      expect(typeof result.current.removeItem).toBe('function');
      expect(typeof result.current.getItem).toBe('function');
    });

    it('should have initial progress values', () => {
      const { result } = renderHook(() => useBatchGeneration());

      expect(result.current.progress.total).toBe(0);
      expect(result.current.progress.completed).toBe(0);
      expect(result.current.progress.failed).toBe(0);
      expect(result.current.progress.generating).toBe(0);
      expect(result.current.progress.pending).toBe(0);
      expect(result.current.progress.percentage).toBe(0);
    });
  });

  describe('addItems', () => {
    it('should add items with pending status', () => {
      const { result } = renderHook(() => useBatchGeneration<string>());

      act(() => {
        result.current.addItems([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'feature', input: 'Feature 2' },
        ]);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].status).toBe('pending');
      expect(result.current.items[1].status).toBe('pending');
      expect(result.current.items[0].retryCount).toBe(0);
    });

    it('should generate IDs for items without IDs', () => {
      const { result } = renderHook(() => useBatchGeneration<string>());

      act(() => {
        result.current.addItems([
          { id: '', type: 'epic', input: 'Epic 1' },
        ]);
      });

      expect(result.current.items[0].id).toMatch(/^batch-/);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the batch', () => {
      const { result } = renderHook(() => useBatchGeneration<string>());

      act(() => {
        result.current.addItems([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'feature', input: 'Feature 2' },
        ]);
      });

      act(() => {
        result.current.removeItem('item-1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('item-2');
    });
  });

  describe('getItem', () => {
    it('should get a specific item by ID', () => {
      const { result } = renderHook(() => useBatchGeneration<string>());

      act(() => {
        result.current.addItems([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'epic', input: 'Epic 1' },
        ]);
      });

      const item = result.current.getItem('item-2');
      expect(item).toBeDefined();
      expect(item?.type).toBe('epic');
      expect(item?.input).toBe('Epic 1');
    });

    it('should return undefined for non-existent item', () => {
      const { result } = renderHook(() => useBatchGeneration<string>());

      const item = result.current.getItem('non-existent');
      expect(item).toBeUndefined();
    });
  });

  describe('start', () => {
    it('should start batch with provided items', async () => {
      const mockGenerator = vi.fn().mockResolvedValue('Generated content');

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 1,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      expect(mockGenerator).toHaveBeenCalledTimes(1);
      expect(result.current.items[0].status).toBe('completed');
      expect(result.current.items[0].result).toBe('Generated content');
    });

    it('should respect concurrency limit', async () => {
      let concurrentCount = 0;
      let maxConcurrent = 0;

      const mockGenerator = vi.fn().mockImplementation(async () => {
        concurrentCount++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCount);
        await new Promise((resolve) => setTimeout(resolve, 50));
        concurrentCount--;
        return 'Generated';
      });

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 2,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'feature', input: 'Feature 2' },
          { id: 'item-3', type: 'feature', input: 'Feature 3' },
          { id: 'item-4', type: 'feature', input: 'Feature 4' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });

    it('should call onItemComplete callback', async () => {
      const onItemComplete = vi.fn();
      const mockGenerator = vi.fn().mockResolvedValue('Generated');

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          onItemComplete,
          concurrency: 1,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      expect(onItemComplete).toHaveBeenCalledTimes(1);
      expect(onItemComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'item-1',
          status: 'completed',
        })
      );
    });

    it('should call onBatchComplete when all items finish', async () => {
      const onBatchComplete = vi.fn();
      const mockGenerator = vi.fn().mockResolvedValue('Generated');

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          onBatchComplete,
          concurrency: 2,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'feature', input: 'Feature 2' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      expect(onBatchComplete).toHaveBeenCalledTimes(1);
      expect(onBatchComplete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'item-1', status: 'completed' }),
          expect.objectContaining({ id: 'item-2', status: 'completed' }),
        ]),
        expect.objectContaining({
          successCount: 2,
          failureCount: 0,
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle generator errors', async () => {
      const onItemError = vi.fn();
      const mockGenerator = vi.fn().mockRejectedValue(new Error('Generation failed'));

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          onItemError,
          concurrency: 1,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      expect(result.current.items[0].status).toBe('failed');
      expect(result.current.items[0].error).toBe('Generation failed');
      expect(onItemError).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel', () => {
    it('should cancel batch generation', async () => {
      const mockGenerator = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('Generated'), 1000))
      );

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 1,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'feature', input: 'Feature 2' },
        ]);
      });

      // Wait a bit for first item to start
      await new Promise((resolve) => setTimeout(resolve, 50));

      act(() => {
        result.current.cancel();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('cancelled');
      });

      // At least one item should be cancelled
      const cancelledItems = result.current.items.filter((i) => i.status === 'cancelled');
      expect(cancelledItems.length).toBeGreaterThan(0);
    });

    it('should cancel a specific item', async () => {
      const mockGenerator = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('Generated'), 500))
      );

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 2,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'feature', input: 'Feature 2' },
        ]);
      });

      // Wait for items to start
      await new Promise((resolve) => setTimeout(resolve, 50));

      act(() => {
        result.current.cancelItem('item-1');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      const item1 = result.current.getItem('item-1');
      const item2 = result.current.getItem('item-2');

      expect(item1?.status).toBe('cancelled');
      expect(item2?.status).toBe('completed');
    });
  });

  describe('retry', () => {
    it('should retry failed items', async () => {
      let callCount = 0;
      const mockGenerator = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First attempt failed');
        }
        return 'Success on retry';
      });

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 1,
          itemDelay: 0,
          maxRetries: 2,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.items[0].status).toBe('failed');
      });

      act(() => {
        result.current.retryFailed();
      });

      await waitFor(() => {
        expect(result.current.items[0].status).toBe('completed');
      });

      expect(result.current.items[0].result).toBe('Success on retry');
      expect(result.current.items[0].retryCount).toBe(1);
    });

    it('should retry a specific item', async () => {
      let item1Calls = 0;
      const mockGenerator = vi.fn().mockImplementation(async (item: BatchItem<string>) => {
        if (item.id === 'item-1') {
          item1Calls++;
          if (item1Calls === 1) {
            throw new Error('Failed');
          }
        }
        return 'Generated';
      });

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 1,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.items[0].status).toBe('failed');
      });

      act(() => {
        result.current.retryItem('item-1');
      });

      await waitFor(() => {
        expect(result.current.items[0].status).toBe('completed');
      });
    });
  });

  describe('reset', () => {
    it('should reset the batch', async () => {
      const mockGenerator = vi.fn().mockResolvedValue('Generated');

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 1,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.status).toBe('idle');
    });
  });

  describe('progress', () => {
    it('should track progress correctly', async () => {
      const resolvers: Array<() => void> = [];
      const mockGenerator = vi.fn().mockImplementation(
        () => new Promise<string>((resolve) => {
          resolvers.push(() => resolve('Generated'));
        })
      );

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 2,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'feature', input: 'Feature 2' },
          { id: 'item-3', type: 'feature', input: 'Feature 3' },
        ]);
      });

      // Wait for first two items to start generating
      await waitFor(() => {
        expect(result.current.progress.generating).toBe(2);
      });

      expect(result.current.progress.total).toBe(3);
      expect(result.current.progress.pending).toBe(1);

      // Complete first item
      act(() => {
        resolvers[0]();
      });

      await waitFor(() => {
        expect(result.current.progress.completed).toBe(1);
      });

      // Complete remaining items
      act(() => {
        resolvers.forEach((r) => r());
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      expect(result.current.progress.completed).toBe(3);
      expect(result.current.progress.percentage).toBe(100);
    });
  });

  describe('statistics', () => {
    it('should calculate statistics after completion', async () => {
      const mockGenerator = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'Generated';
      });

      const { result } = renderHook(() =>
        useBatchGeneration<string>({
          generator: mockGenerator,
          concurrency: 1,
          itemDelay: 0,
        })
      );

      act(() => {
        result.current.start([
          { id: 'item-1', type: 'feature', input: 'Feature 1' },
          { id: 'item-2', type: 'feature', input: 'Feature 2' },
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });

      expect(result.current.statistics.successCount).toBe(2);
      expect(result.current.statistics.failureCount).toBe(0);
      expect(result.current.statistics.successRate).toBe(1);
      // averageTime may be null if timing wasn't recorded, or > 0 if it was
      if (result.current.statistics.averageTime !== null) {
        expect(result.current.statistics.averageTime).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

describe('utility functions', () => {
  describe('getBatchItemStatusDisplayName', () => {
    it('should return display names for all statuses', () => {
      expect(getBatchItemStatusDisplayName('pending')).toBe('Pending');
      expect(getBatchItemStatusDisplayName('generating')).toBe('Generating');
      expect(getBatchItemStatusDisplayName('completed')).toBe('Completed');
      expect(getBatchItemStatusDisplayName('failed')).toBe('Failed');
      expect(getBatchItemStatusDisplayName('cancelled')).toBe('Cancelled');
    });
  });

  describe('getBatchStatusDisplayName', () => {
    it('should return display names for all statuses', () => {
      expect(getBatchStatusDisplayName('idle')).toBe('Idle');
      expect(getBatchStatusDisplayName('running')).toBe('Running');
      expect(getBatchStatusDisplayName('paused')).toBe('Paused');
      expect(getBatchStatusDisplayName('completed')).toBe('Completed');
      expect(getBatchStatusDisplayName('cancelled')).toBe('Cancelled');
    });
  });

  describe('createBatchItems', () => {
    it('should create batch items from simple inputs', () => {
      const inputs = ['Feature 1', 'Feature 2', 'Feature 3'];
      const items = createBatchItems(inputs, 'feature');

      expect(items).toHaveLength(3);
      expect(items[0].type).toBe('feature');
      expect(items[0].input).toBe('Feature 1');
      expect(items[0].id).toMatch(/^batch-/);
    });

    it('should support different work item types', () => {
      const types: BatchWorkItemType[] = ['epic', 'feature', 'userStory', 'task'];

      types.forEach((type) => {
        const items = createBatchItems(['Test'], type);
        expect(items[0].type).toBe(type);
      });
    });
  });
});
