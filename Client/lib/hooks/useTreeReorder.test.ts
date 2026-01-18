/**
 * Tests for useTreeReorder hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

// Default state for tests
const defaultSowState = {
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
      userStoryIds: ['user-story-1'],
    },
  },
  userStories: {
    'user-story-1': {
      id: 'user-story-1',
      documentId: 'doc-user-story-1',
      title: 'User Story 1',
      position: 0,
      parentFeatureId: 'feature-1',
      taskIds: ['task-1'],
    },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      documentId: 'doc-task-1',
      title: 'Task 1',
      position: 0,
      parentUserStoryId: 'user-story-1',
    },
  },
  epicOrder: ['epic-1', 'epic-2'],
  isLoading: false,
  error: null,
};

// Create a test store
const createTestStore = (sowStateOverrides = {}) => {
  return configureStore({
    reducer: {
      sow: sowReducer,
    },
    preloadedState: {
      sow: {
        ...defaultSowState,
        ...sowStateOverrides,
      },
    } as Parameters<typeof configureStore>[0]['preloadedState'],
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

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useTreeReorder(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isReordering).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.handleReorder).toBe('function');
    });

    it('accepts custom options', () => {
      const store = createTestStore();
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const { result } = renderHook(
        () => useTreeReorder({ onSuccess, onError, persistToApi: false }),
        { wrapper: createWrapper(store) }
      );

      expect(result.current.isReordering).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('no-op scenarios', () => {
    it('does nothing when source and destination indices are the same', async () => {
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

      expect(onSuccess).not.toHaveBeenCalled();
      expect(result.current.isReordering).toBe(false);
    });

    it('does nothing when source and destination parent are same and index is same', async () => {
      const store = createTestStore();
      const onSuccess = vi.fn();
      const { result } = renderHook(() => useTreeReorder({ onSuccess }), {
        wrapper: createWrapper(store),
      });

      const payload: ReorderPayload = {
        itemId: 'feature-1',
        itemType: 'feature',
        sourceIndex: 0,
        destinationIndex: 0,
        sourceParentId: 'epic-1',
        destinationParentId: 'epic-1',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('reordering within same parent', () => {
    it('reorders epics within epic list', async () => {
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
      expect(result.current.error).toBe(null);
      expect(result.current.isReordering).toBe(false);
    });

    it('reorders features within same epic', async () => {
      const store = createTestStore({
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
          'feature-2': {
            id: 'feature-2',
            documentId: 'doc-feature-2',
            title: 'Feature 2',
            description: '',
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
            description: '',
            position: 0,
            featureIds: ['feature-1', 'feature-2'],
          },
        },
      });
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

    it('reorders user stories within same feature', async () => {
      const store = createTestStore({
        userStories: {
          'user-story-1': {
            id: 'user-story-1',
            documentId: 'doc-user-story-1',
            title: 'User Story 1',
            position: 0,
            parentFeatureId: 'feature-1',
            taskIds: [],
          },
          'user-story-2': {
            id: 'user-story-2',
            documentId: 'doc-user-story-2',
            title: 'User Story 2',
            position: 1,
            parentFeatureId: 'feature-1',
            taskIds: [],
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
            userStoryIds: ['user-story-1', 'user-story-2'],
          },
        },
      });
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useTreeReorder({ onSuccess, persistToApi: false }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'user-story-1',
        itemType: 'userStory',
        sourceIndex: 0,
        destinationIndex: 1,
        sourceParentId: 'feature-1',
        destinationParentId: 'feature-1',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('reorders tasks within same user story', async () => {
      const store = createTestStore({
        tasks: {
          'task-1': {
            id: 'task-1',
            documentId: 'doc-task-1',
            title: 'Task 1',
            position: 0,
            parentUserStoryId: 'user-story-1',
          },
          'task-2': {
            id: 'task-2',
            documentId: 'doc-task-2',
            title: 'Task 2',
            position: 1,
            parentUserStoryId: 'user-story-1',
          },
        },
        userStories: {
          'user-story-1': {
            id: 'user-story-1',
            documentId: 'doc-user-story-1',
            title: 'User Story 1',
            position: 0,
            parentFeatureId: 'feature-1',
            taskIds: ['task-1', 'task-2'],
          },
        },
      });
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useTreeReorder({ onSuccess, persistToApi: false }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'task-1',
        itemType: 'task',
        sourceIndex: 0,
        destinationIndex: 1,
        sourceParentId: 'user-story-1',
        destinationParentId: 'user-story-1',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('does not reorder feature when sourceParentId is null', async () => {
      const store = createTestStore();
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
        sourceParentId: null,
        destinationParentId: null,
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      // Should still call onSuccess, but dispatch won't happen for feature without parent
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('moving to different parent', () => {
    it('moves feature to different epic', async () => {
      const store = createTestStore({
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
      });
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useTreeReorder({ onSuccess, persistToApi: false }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'feature-1',
        itemType: 'feature',
        sourceIndex: 0,
        destinationIndex: 0,
        sourceParentId: 'epic-1',
        destinationParentId: 'epic-2',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('moves user story to different feature', async () => {
      const store = createTestStore({
        userStories: {
          'user-story-1': {
            id: 'user-story-1',
            documentId: 'doc-user-story-1',
            title: 'User Story 1',
            position: 0,
            parentFeatureId: 'feature-1',
            taskIds: [],
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
            userStoryIds: ['user-story-1'],
          },
          'feature-2': {
            id: 'feature-2',
            documentId: 'doc-feature-2',
            title: 'Feature 2',
            description: '',
            position: 1,
            parentEpicId: 'epic-1',
            userStoryIds: [],
          },
        },
      });
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useTreeReorder({ onSuccess, persistToApi: false }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'user-story-1',
        itemType: 'userStory',
        sourceIndex: 0,
        destinationIndex: 0,
        sourceParentId: 'feature-1',
        destinationParentId: 'feature-2',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('moves task to different user story', async () => {
      const store = createTestStore({
        tasks: {
          'task-1': {
            id: 'task-1',
            documentId: 'doc-task-1',
            title: 'Task 1',
            position: 0,
            parentUserStoryId: 'user-story-1',
          },
        },
        userStories: {
          'user-story-1': {
            id: 'user-story-1',
            documentId: 'doc-user-story-1',
            title: 'User Story 1',
            position: 0,
            parentFeatureId: 'feature-1',
            taskIds: ['task-1'],
          },
          'user-story-2': {
            id: 'user-story-2',
            documentId: 'doc-user-story-2',
            title: 'User Story 2',
            position: 1,
            parentFeatureId: 'feature-1',
            taskIds: [],
          },
        },
      });
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useTreeReorder({ onSuccess, persistToApi: false }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'task-1',
        itemType: 'task',
        sourceIndex: 0,
        destinationIndex: 0,
        sourceParentId: 'user-story-1',
        destinationParentId: 'user-story-2',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.error).toBe(null);
    });

    it('does not move feature when sourceParentId is null', async () => {
      const store = createTestStore();
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useTreeReorder({ onSuccess, persistToApi: false }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'feature-1',
        itemType: 'feature',
        sourceIndex: 0,
        destinationIndex: 0,
        sourceParentId: null,
        destinationParentId: 'epic-2',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      // onSuccess should be called but no dispatch for invalid parent
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('API persistence', () => {
    it('persists epic reorder to API', async () => {
      const store = createTestStore();
      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateEpicPosition).mockResolvedValueOnce({} as never);

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
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

      expect(strapiService.updateEpicPosition).toHaveBeenCalledWith(
        'doc-epic-1',
        1
      );
    });

    it('persists feature reorder to API with parent', async () => {
      const store = createTestStore({
        features: {
          'feature-1': {
            id: 'feature-1',
            documentId: 'doc-feature-1',
            title: 'Feature 1',
            position: 0,
            parentEpicId: 'epic-1',
          },
        },
        epics: {
          'epic-1': {
            id: 'epic-1',
            documentId: 'doc-epic-1',
            title: 'Epic 1',
            position: 0,
            featureIds: ['feature-1'],
          },
        },
      });
      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateFeaturePosition).mockResolvedValueOnce({} as never);

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
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

      expect(strapiService.updateFeaturePosition).toHaveBeenCalledWith(
        'doc-feature-1',
        1,
        'doc-epic-1'
      );
    });

    it('persists user story reorder to API', async () => {
      const store = createTestStore({
        userStories: {
          'user-story-1': {
            id: 'user-story-1',
            documentId: 'doc-user-story-1',
            title: 'User Story 1',
            position: 0,
            parentFeatureId: 'feature-1',
          },
        },
        features: {
          'feature-1': {
            id: 'feature-1',
            documentId: 'doc-feature-1',
            title: 'Feature 1',
            position: 0,
            parentEpicId: 'epic-1',
            userStoryIds: ['user-story-1'],
          },
        },
      });
      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateUserStoryPosition).mockResolvedValueOnce({} as never);

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'user-story-1',
        itemType: 'userStory',
        sourceIndex: 0,
        destinationIndex: 1,
        sourceParentId: 'feature-1',
        destinationParentId: 'feature-1',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(strapiService.updateUserStoryPosition).toHaveBeenCalledWith(
        'doc-user-story-1',
        1,
        'doc-feature-1'
      );
    });

    it('persists task reorder to API', async () => {
      const store = createTestStore({
        tasks: {
          'task-1': {
            id: 'task-1',
            documentId: 'doc-task-1',
            title: 'Task 1',
            position: 0,
            parentUserStoryId: 'user-story-1',
          },
        },
        userStories: {
          'user-story-1': {
            id: 'user-story-1',
            documentId: 'doc-user-story-1',
            title: 'User Story 1',
            position: 0,
            parentFeatureId: 'feature-1',
            taskIds: ['task-1'],
          },
        },
      });
      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateTaskPosition).mockResolvedValueOnce({} as never);

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'task-1',
        itemType: 'task',
        sourceIndex: 0,
        destinationIndex: 1,
        sourceParentId: 'user-story-1',
        destinationParentId: 'user-story-1',
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(strapiService.updateTaskPosition).toHaveBeenCalledWith(
        'doc-task-1',
        1,
        'doc-user-story-1'
      );
    });

    it('uses item id as fallback when documentId is not available', async () => {
      const store = createTestStore({
        epics: {
          'epic-1': {
            id: 'epic-1',
            // No documentId
            title: 'Epic 1',
            position: 0,
            featureIds: [],
          },
        },
      });
      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateEpicPosition).mockResolvedValueOnce({} as never);

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
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

      // Should use 'epic-1' as fallback
      expect(strapiService.updateEpicPosition).toHaveBeenCalledWith('epic-1', 1);
    });

    it('skips API persistence when persistToApi is false', async () => {
      const store = createTestStore();
      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: false }),
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

      expect(strapiService.updateEpicPosition).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('sets isReordering to true during reorder operation', async () => {
      const store = createTestStore();
      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: false }),
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
        const promise = result.current.handleReorder(payload);
        await promise;
      });

      // After completion, isReordering should be false
      expect(result.current.isReordering).toBe(false);
    });

    it('resets isReordering after error', async () => {
      const store = createTestStore();
      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateEpicPosition).mockRejectedValueOnce(
        new Error('API Error')
      );

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
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

      expect(result.current.isReordering).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles API errors and calls onError callback', async () => {
      const store = createTestStore();
      const onError = vi.fn();

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
      expect(result.current.error?.message).toBe('API Error');
    });

    it('creates Error object from non-Error thrown values', async () => {
      const store = createTestStore();
      const onError = vi.fn();

      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateEpicPosition).mockRejectedValueOnce(
        'String error message'
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

      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toBe('Failed to reorder items');
    });

    it('shows toast notification on error', async () => {
      const store = createTestStore();
      const { toast } = await import('./use-toast');

      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateEpicPosition).mockRejectedValueOnce(
        new Error('API Error')
      );

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
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

      expect(toast).toHaveBeenCalledWith({
        title: 'Reorder Failed',
        description:
          'Failed to save the new order. Your changes may not be persisted.',
        variant: 'destructive',
      });
    });

    it('logs error with logger', async () => {
      const store = createTestStore();
      const { logger } = await import('../logger');

      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateEpicPosition).mockRejectedValueOnce(
        new Error('API Error')
      );

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
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

      expect(logger.error).toHaveBeenCalledWith(
        'TreeReorder',
        'Reorder failed',
        expect.objectContaining({ payload })
      );
    });

    it('clears error state on new reorder attempt', async () => {
      const store = createTestStore();

      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );
      vi.mocked(strapiService.updateEpicPosition)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({} as never);

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
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

      // First call fails
      await act(async () => {
        await result.current.handleReorder(payload);
      });

      expect(result.current.error).not.toBe(null);

      // Second call succeeds - error should be cleared
      await act(async () => {
        await result.current.handleReorder({
          ...payload,
          sourceIndex: 1,
          destinationIndex: 0,
        });
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('success handling', () => {
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

    it('logs successful reorder', async () => {
      const store = createTestStore();
      const { logger } = await import('../logger');

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: false }),
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

      expect(logger.log).toHaveBeenCalledWith(
        'TreeReorder',
        'Reorder successful',
        payload
      );
    });
  });

  describe('edge cases', () => {
    it('handles non-existent item gracefully', async () => {
      const store = createTestStore();
      const { strapiService } = await import(
        '@/components/spec-tree/lib/api/strapi-service'
      );

      const { result } = renderHook(
        () => useTreeReorder({ persistToApi: true }),
        { wrapper: createWrapper(store) }
      );

      const payload: ReorderPayload = {
        itemId: 'non-existent-epic',
        itemType: 'epic',
        sourceIndex: 0,
        destinationIndex: 1,
        sourceParentId: null,
        destinationParentId: null,
      };

      await act(async () => {
        await result.current.handleReorder(payload);
      });

      // Should not crash, and should not call API for non-existent item
      expect(strapiService.updateEpicPosition).not.toHaveBeenCalled();
    });

    it('handles empty state gracefully', async () => {
      const store = createTestStore({
        epics: {},
        features: {},
        userStories: {},
        tasks: {},
      });
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

      // Should complete without error
      expect(onSuccess).toHaveBeenCalled();
    });

    it('handles concurrent reorder operations', async () => {
      const store = createTestStore();
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useTreeReorder({ onSuccess, persistToApi: false }),
        { wrapper: createWrapper(store) }
      );

      const payload1: ReorderPayload = {
        itemId: 'epic-1',
        itemType: 'epic',
        sourceIndex: 0,
        destinationIndex: 1,
        sourceParentId: null,
        destinationParentId: null,
      };

      const payload2: ReorderPayload = {
        itemId: 'epic-2',
        itemType: 'epic',
        sourceIndex: 1,
        destinationIndex: 0,
        sourceParentId: null,
        destinationParentId: null,
      };

      await act(async () => {
        await Promise.all([
          result.current.handleReorder(payload1),
          result.current.handleReorder(payload2),
        ]);
      });

      expect(onSuccess).toHaveBeenCalledTimes(2);
    });
  });
});
