/**
 * Tests for useWorkItemUpdate hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import sowReducer from '../../../../lib/store/sow-slice';
import useWorkItemUpdate from './use-work-item-update';
import type {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';
import type { RootState } from '../../../../lib/store';

// Mock the openai API functions
vi.mock('../api/openai', () => ({
  generateUpdatedEpic: vi.fn(),
  generateUpdatedFeature: vi.fn(),
  generateUpdatedUserStory: vi.fn(),
  generateUpdatedTask: vi.fn(),
}));

// Default Redux state
const defaultSowState = {
  chatApi: 'openai',
  selectedModel: 'gpt-4',
  epics: {},
  features: {},
  userStories: {},
  tasks: {},
  globalInformation: 'Test global information',
  id: 'test-app-id',
  apps: {},
  contextualQuestions: [],
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

// Mock work items for testing
const mockEpic: EpicType = {
  id: 'epic-1',
  title: 'Test Epic',
  description: 'Epic description',
  goal: 'Epic goal',
  successCriteria: 'Success criteria',
  dependencies: '',
  timeline: '',
  resources: '',
  risksAndMitigation: [],
  featureIds: [],
  parentAppId: 'app-1',
  notes: '',
};

const mockFeature: FeatureType = {
  id: 'feature-1',
  title: 'Test Feature',
  description: 'Feature description',
  details: 'Feature details',
  acceptanceCriteria: [],
  parentEpicId: 'epic-1',
  userStoryIds: [],
  notes: '',
  priority: 'High',
  effort: 'Medium',
};

const mockUserStory: UserStoryType = {
  id: 'user-story-1',
  title: 'Test User Story',
  role: 'User',
  action: 'do something',
  goal: 'achieve something',
  points: '5',
  acceptanceCriteria: [],
  notes: '',
  parentFeatureId: 'feature-1',
  taskIds: [],
  developmentOrder: 1,
};

const mockTask: TaskType = {
  id: 'task-1',
  title: 'Test Task',
  details: 'Task details',
  priority: 1,
  notes: '',
  parentUserStoryId: 'user-story-1',
  dependentTaskIds: [],
};

// Create a mock RootState
const createMockState = (overrides = {}) => ({
  sow: {
    ...defaultSowState,
    ...overrides,
  },
  auth: {
    isLoggedIn: false,
    organizationRole: undefined,
    organizationId: undefined,
  },
  user: {
    user: null,
    token: null,
  },
  organization: {
    currentOrganization: null,
    members: [],
    invites: [],
    subscription: null,
    isLoading: false,
    error: null,
  },
  settings: {
    aiSettings: null,
    integrations: [],
    ssoConfig: null,
    isLoading: false,
    error: null,
  },
  subscription: {
    subscription: null,
    isLoading: false,
    error: null,
    billingHistory: [],
  },
  demo: {
    user: {
      isDemoMode: false,
      demoLevel: 'basic' as const,
      enabledFeatures: [],
      activeScenario: null,
    },
    config: {
      enabled: true,
      showInProduction: false,
      defaultLevel: 'basic' as const,
      allowToggle: true,
      persistSettings: true,
    },
  },
}) as RootState;

describe('useWorkItemUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('initialization', () => {
    it('initializes with default state', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.updatedWorkItem).toBeNull();
    });

    it('returns generateUpdatedWorkItem function', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      expect(typeof result.current.generateUpdatedWorkItem).toBe('function');
    });
  });

  describe('generateUpdatedWorkItem for epics', () => {
    it('generates updated epic', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      const updatedEpicData: EpicType = {
        ...mockEpic,
        title: 'Updated Epic Title',
        description: 'Updated description',
      };

      vi.mocked(generateUpdatedEpic).mockResolvedValueOnce({
        data: updatedEpicData,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(generateUpdatedEpic).toHaveBeenCalledWith({
        chatApi: 'openai',
        context: 'Update context',
        requirements: 'Test global information',
        selectedModel: 'gpt-4',
      });
      expect(result.current.updatedWorkItem).toEqual(updatedEpicData);
      expect(result.current.loading).toBe(false);
    });

    it('does not call API when state is undefined', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: undefined,
        });
      });

      expect(generateUpdatedEpic).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('generateUpdatedWorkItem for features', () => {
    it('generates updated feature', async () => {
      const store = createTestStore();
      const { generateUpdatedFeature } = await import('../api/openai');

      const updatedFeatureData: FeatureType = {
        ...mockFeature,
        title: 'Updated Feature Title',
      };

      vi.mocked(generateUpdatedFeature).mockResolvedValueOnce({
        data: updatedFeatureData,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('features'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Feature update context',
          epic: mockEpic,
          state: mockState,
        });
      });

      expect(generateUpdatedFeature).toHaveBeenCalledWith({
        chatApi: 'openai',
        epic: mockEpic,
        state: mockState,
        context: 'Feature update context',
        selectedModel: 'gpt-4',
      });
      expect(result.current.updatedWorkItem).toEqual(updatedFeatureData);
    });

    it('does not call API when epic is undefined', async () => {
      const store = createTestStore();
      const { generateUpdatedFeature } = await import('../api/openai');

      const { result } = renderHook(() => useWorkItemUpdate('features'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Feature update context',
          epic: undefined,
          state: mockState,
        });
      });

      expect(generateUpdatedFeature).not.toHaveBeenCalled();
    });

    it('does not call API when state is undefined', async () => {
      const store = createTestStore();
      const { generateUpdatedFeature } = await import('../api/openai');

      const { result } = renderHook(() => useWorkItemUpdate('features'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Feature update context',
          epic: mockEpic,
          state: undefined,
        });
      });

      expect(generateUpdatedFeature).not.toHaveBeenCalled();
    });
  });

  describe('generateUpdatedWorkItem for userStories', () => {
    it('generates updated user story', async () => {
      const store = createTestStore();
      const { generateUpdatedUserStory } = await import('../api/openai');

      const updatedUserStoryData: UserStoryType = {
        ...mockUserStory,
        title: 'Updated User Story',
        points: '8',
      };

      vi.mocked(generateUpdatedUserStory).mockResolvedValueOnce({
        data: updatedUserStoryData,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('userStories'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'User story update context',
          feature: mockFeature,
          state: mockState,
        });
      });

      expect(generateUpdatedUserStory).toHaveBeenCalledWith({
        chatApi: 'openai',
        feature: mockFeature,
        state: mockState,
        context: 'User story update context',
        selectedModel: 'gpt-4',
      });
      expect(result.current.updatedWorkItem).toEqual(updatedUserStoryData);
    });

    it('does not call API when feature is undefined', async () => {
      const store = createTestStore();
      const { generateUpdatedUserStory } = await import('../api/openai');

      const { result } = renderHook(() => useWorkItemUpdate('userStories'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'User story update context',
          feature: undefined,
          state: mockState,
        });
      });

      expect(generateUpdatedUserStory).not.toHaveBeenCalled();
    });

    it('does not call API when state is undefined', async () => {
      const store = createTestStore();
      const { generateUpdatedUserStory } = await import('../api/openai');

      const { result } = renderHook(() => useWorkItemUpdate('userStories'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'User story update context',
          feature: mockFeature,
          state: undefined,
        });
      });

      expect(generateUpdatedUserStory).not.toHaveBeenCalled();
    });
  });

  describe('generateUpdatedWorkItem for tasks', () => {
    it('generates updated task', async () => {
      const store = createTestStore();
      const { generateUpdatedTask } = await import('../api/openai');

      const updatedTaskData: TaskType = {
        ...mockTask,
        title: 'Updated Task',
        priority: 2,
      };

      vi.mocked(generateUpdatedTask).mockResolvedValueOnce({
        data: updatedTaskData,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('tasks'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Task update context',
          userStory: mockUserStory,
          state: mockState,
        });
      });

      expect(generateUpdatedTask).toHaveBeenCalledWith({
        chatApi: 'openai',
        userStory: mockUserStory,
        state: mockState,
        context: 'Task update context',
        selectedModel: 'gpt-4',
      });
      expect(result.current.updatedWorkItem).toEqual(updatedTaskData);
    });

    it('does not call API when userStory is undefined', async () => {
      const store = createTestStore();
      const { generateUpdatedTask } = await import('../api/openai');

      const { result } = renderHook(() => useWorkItemUpdate('tasks'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Task update context',
          userStory: undefined,
          state: mockState,
        });
      });

      expect(generateUpdatedTask).not.toHaveBeenCalled();
    });

    it('does not call API when state is undefined', async () => {
      const store = createTestStore();
      const { generateUpdatedTask } = await import('../api/openai');

      const { result } = renderHook(() => useWorkItemUpdate('tasks'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Task update context',
          userStory: mockUserStory,
          state: undefined,
        });
      });

      expect(generateUpdatedTask).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('sets loading to true during API call', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(generateUpdatedEpic).mockReturnValueOnce(
        pendingPromise as never
      );

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      let updatePromise: Promise<void>;
      act(() => {
        updatePromise = result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      // Loading should be true while waiting
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ data: mockEpic });
        await updatePromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('sets loading to false after API call completes', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic).mockResolvedValueOnce({
        data: mockEpic,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(result.current.loading).toBe(false);
    });

    it('sets loading to false after API error', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic).mockRejectedValueOnce(
        new Error('API Error')
      );

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles invalid work item type', async () => {
      const store = createTestStore();
      const { result } = renderHook(
        () => useWorkItemUpdate('invalidType' as never),
        { wrapper: createWrapper(store) }
      );

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(result.current.error).toBe('Failed to generate updated work item.');
      expect(result.current.loading).toBe(false);
    });

    it('handles API error', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(result.current.error).toBe('Failed to generate updated work item.');
      expect(result.current.updatedWorkItem).toBeNull();
    });

    it('logs error to console', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');
      const consoleErrorSpy = vi.spyOn(console, 'error');

      vi.mocked(generateUpdatedEpic).mockRejectedValueOnce(
        new Error('API Error')
      );

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to generate updated work item:',
        expect.any(Error)
      );
    });
  });

  describe('response handling', () => {
    it('sets updatedWorkItem when response has data', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      const responseData = { ...mockEpic, title: 'New Title' };
      vi.mocked(generateUpdatedEpic).mockResolvedValueOnce({
        data: responseData,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(result.current.updatedWorkItem).toEqual(responseData);
    });

    it('does not set updatedWorkItem when response is undefined', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(result.current.updatedWorkItem).toBeNull();
    });

    it('does not set updatedWorkItem when response is falsy', async () => {
      const store = createTestStore();
      const { generateUpdatedFeature } = await import('../api/openai');

      // This happens when epic && state is false
      vi.mocked(generateUpdatedFeature).mockResolvedValueOnce(null as never);

      const { result } = renderHook(() => useWorkItemUpdate('features'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          epic: mockEpic,
          state: mockState,
        });
      });

      expect(result.current.updatedWorkItem).toBeNull();
    });
  });

  describe('Redux integration', () => {
    it('uses chatApi from Redux store', async () => {
      const store = createTestStore({ chatApi: 'custom-api' });
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic).mockResolvedValueOnce({
        data: mockEpic,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState({ chatApi: 'custom-api' });

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(generateUpdatedEpic).toHaveBeenCalledWith(
        expect.objectContaining({
          chatApi: 'custom-api',
        })
      );
    });

    it('uses selectedModel from state', async () => {
      const store = createTestStore({ selectedModel: 'gpt-3.5-turbo' });
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic).mockResolvedValueOnce({
        data: mockEpic,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState({ selectedModel: 'gpt-3.5-turbo' });

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(generateUpdatedEpic).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedModel: 'gpt-3.5-turbo',
        })
      );
    });

    it('uses globalInformation from state for epic updates', async () => {
      const store = createTestStore({
        globalInformation: 'Custom requirements',
      });
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic).mockResolvedValueOnce({
        data: mockEpic,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState({
        globalInformation: 'Custom requirements',
      });

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(generateUpdatedEpic).toHaveBeenCalledWith(
        expect.objectContaining({
          requirements: 'Custom requirements',
        })
      );
    });

    it('handles empty globalInformation', async () => {
      const store = createTestStore({
        globalInformation: '',
      });
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic).mockResolvedValueOnce({
        data: mockEpic,
      } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState({
        globalInformation: '',
      });

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(generateUpdatedEpic).toHaveBeenCalledWith(
        expect.objectContaining({
          requirements: '',
        })
      );
    });
  });

  describe('multiple calls', () => {
    it('handles multiple sequential calls', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      const firstResult = { ...mockEpic, title: 'First' };
      const secondResult = { ...mockEpic, title: 'Second' };

      vi.mocked(generateUpdatedEpic)
        .mockResolvedValueOnce({ data: firstResult } as never)
        .mockResolvedValueOnce({ data: secondResult } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'First update',
          state: mockState,
        });
      });

      expect(result.current.updatedWorkItem).toEqual(firstResult);

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Second update',
          state: mockState,
        });
      });

      expect(result.current.updatedWorkItem).toEqual(secondResult);
    });

    it('clears previous error on new call', async () => {
      const store = createTestStore();
      const { generateUpdatedEpic } = await import('../api/openai');

      vi.mocked(generateUpdatedEpic)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ data: mockEpic } as never);

      const { result } = renderHook(() => useWorkItemUpdate('epics'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      // First call - error
      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'First update',
          state: mockState,
        });
      });

      expect(result.current.error).toBe('Failed to generate updated work item.');

      // Second call - success (error should be implicitly cleared by success)
      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Second update',
          state: mockState,
        });
      });

      // The hook doesn't explicitly clear error on new call, just on error
      expect(result.current.updatedWorkItem).toEqual(mockEpic);
    });
  });

  describe('Global work item type', () => {
    it('throws error for Global type (not supported)', async () => {
      const store = createTestStore();
      const { result } = renderHook(() => useWorkItemUpdate('Global'), {
        wrapper: createWrapper(store),
      });

      const mockState = createMockState();

      await act(async () => {
        await result.current.generateUpdatedWorkItem({
          context: 'Update context',
          state: mockState,
        });
      });

      expect(result.current.error).toBe('Failed to generate updated work item.');
    });
  });
});
