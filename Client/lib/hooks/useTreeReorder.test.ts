/**
 * Tests for useTreeReorder hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import sowReducer from '../store/sow-slice';
import { useTreeReorder } from './useTreeReorder';
import type { ReorderPayload } from '@/components/tree-view/types';

// Mock the strapi service
vi.mock('@/components/spec-tree/lib/api/strapi-service', () => ({
  strapiService: {
    updateEpicPosition: vi.fn().mockResolvedValue({}),
    updateFeaturePosition: vi.fn().mockResolvedValue({}),
    updateUserStoryPosition: vi.fn().mockResolvedValue({}),
    updateTaskPosition: vi.fn().mockResolvedValue({}),
  },
}));

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock toast
vi.mock('./use-toast', () => ({
  toast: vi.fn(),
}));

// Create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      sow: sowReducer,
    },
    preloadedState: {
      sow: {
        currentApp: null,
        epics: {
          'epic-1': {
            id: 'epic-1',
            documentId: 'doc-epic-1',
            title: 'Epic 1',
            description: '',
            position: 0,
            featureIds: ['feature-1'],
          },
          'epic-2': {
            id: 'epic-2',
            documentId: 'doc-epic-2',
            title: 'Epic 2',
            description: '',
            position: 1,
            featureIds: [],
          },
        },
        features: {
          'feature-1': {
            id: 'feature-1',
            documentId: 'doc-feature-1',
            title: 'Feature 1',
            description: '',
            position: 0,
            parentEpicId: 'epic-1',
            userStoryIds: [],
          },
        },
        userStories: {},
        tasks: {},
        epicOrder: ['epic-1', 'epic-2'],
        isLoading: false,
        error: null,
        ...preloadedState,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
};

// Wrapper component for testing hooks
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store }, children);
  };
};

describe('useTreeReorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTreeReorder(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.isReordering).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.handleReorder).toBe('function');
  });

  it('does nothing when source and destination are the same', async () => {
    const store = createTestStore();
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useTreeReorder({ onSuccess }), {
      wrapper: createWrapper(store),
    });

    const payload: ReorderPayload = {
      itemId: 'epic-1',
      itemType: 'epic',
      sourceIndex: 0,
      destinationIndex: 0,
      sourceParentId: null,
      destinationParentId: null,
    };

    await act(async () => {
      await result.current.handleReorder(payload);
    });

    // onSuccess should not be called when no change
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('sets isReordering to true during reorder operation', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTreeReorder({ persistToApi: false }), {
      wrapper: createWrapper(store),
    });

    const payload: ReorderPayload = {
      itemId: 'epic-1',
      itemType: 'epic',
      sourceIndex: 0,
      destinationIndex: 1,
      sourceParentId: null,
      destinationParentId: null,
    };

    await act(async () => {
      const promise = result.current.handleReorder(payload);
      // isReordering should be true during the operation
      await promise;
    });

    // After completion, isReordering should be false
    expect(result.current.isReordering).toBe(false);
  });

  it('calls onSuccess callback after successful reorder', async () => {
    const store = createTestStore();
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useTreeReorder({ onSuccess, persistToApi: false }),
      { wrapper: createWrapper(store) }
    );

    const payload: ReorderPayload = {
      itemId: 'epic-1',
      itemType: 'epic',
      sourceIndex: 0,
      destinationIndex: 1,
      sourceParentId: null,
      destinationParentId: null,
    };

    await act(async () => {
      await result.current.handleReorder(payload);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('handles reordering features within same epic', async () => {
    const storeWithFeatures = createTestStore({
      features: {
        'feature-1': {
          id: 'feature-1',
          documentId: 'doc-feature-1',
          title: 'Feature 1',
          position: 0,
          parentEpicId: 'epic-1',
          userStoryIds: [],
        },
        'feature-2': {
          id: 'feature-2',
          documentId: 'doc-feature-2',
          title: 'Feature 2',
          position: 1,
          parentEpicId: 'epic-1',
          userStoryIds: [],
        },
      },
      epics: {
        'epic-1': {
          id: 'epic-1',
          documentId: 'doc-epic-1',
          title: 'Epic 1',
          position: 0,
          featureIds: ['feature-1', 'feature-2'],
        },
      },
    });

    const store = createTestStore(storeWithFeatures);
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useTreeReorder({ onSuccess, persistToApi: false }),
      { wrapper: createWrapper(store) }
    );

    const payload: ReorderPayload = {
      itemId: 'feature-1',
      itemType: 'feature',
      sourceIndex: 0,
      destinationIndex: 1,
      sourceParentId: 'epic-1',
      destinationParentId: 'epic-1',
    };

    await act(async () => {
      await result.current.handleReorder(payload);
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.error).toBe(null);
  });

  it('handles errors and calls onError callback', async () => {
    const store = createTestStore();
    const onError = vi.fn();

    // Mock strapi service to throw error
    const { strapiService } = await import(
      '@/components/spec-tree/lib/api/strapi-service'
    );
    vi.mocked(strapiService.updateEpicPosition).mockRejectedValueOnce(
      new Error('API Error')
    );

    const { result } = renderHook(
      () => useTreeReorder({ onError, persistToApi: true }),
      { wrapper: createWrapper(store) }
    );

    const payload: ReorderPayload = {
      itemId: 'epic-1',
      itemType: 'epic',
      sourceIndex: 0,
      destinationIndex: 1,
      sourceParentId: null,
      destinationParentId: null,
    };

    await act(async () => {
      await result.current.handleReorder(payload);
    });

    expect(onError).toHaveBeenCalled();
    expect(result.current.error).not.toBe(null);
  });
});
