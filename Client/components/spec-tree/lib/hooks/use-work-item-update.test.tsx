import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock the openai module
vi.mock('../api/openai', () => ({
  generateUpdatedEpic: vi.fn(),
  generateUpdatedFeature: vi.fn(),
  generateUpdatedUserStory: vi.fn(),
  generateUpdatedTask: vi.fn(),
}));

import useWorkItemUpdate from './use-work-item-update';
import * as openaiModule from '../api/openai';

describe('useWorkItemUpdate', () => {
  const createTestStore = () =>
    configureStore({
      reducer: {
        sow: () => ({
          chatApi: 'mock-api',
          globalInformation: 'Global info',
          selectedModel: 'gpt-4',
        }),
      },
    });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={createTestStore()}>{children}</Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useWorkItemUpdate('epics'), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.updatedWorkItem).toBeNull();
  });

  it('provides generateUpdatedWorkItem function', () => {
    const { result } = renderHook(() => useWorkItemUpdate('epics'), { wrapper });

    expect(typeof result.current.generateUpdatedWorkItem).toBe('function');
  });

  it('sets loading to true when generating epics', async () => {
    vi.mocked(openaiModule.generateUpdatedEpic).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
    );

    const { result } = renderHook(() => useWorkItemUpdate('epics'), { wrapper });

    act(() => {
      result.current.generateUpdatedWorkItem({
        context: 'test context',
        state: {
          sow: {
            globalInformation: 'info',
            selectedModel: 'gpt-4',
            chatApi: 'api',
            id: 'test',
            apps: {},
            epics: {},
            features: {},
            userStories: {},
            tasks: {},
            contextualQuestions: [],
          },
        } as Parameters<typeof result.current.generateUpdatedWorkItem>[0]['state'],
      });
    });

    expect(result.current.loading).toBe(true);
  });

  it('handles generateUpdatedEpic success', async () => {
    const mockEpic = { id: 'epic-1', title: 'Updated Epic' };
    vi.mocked(openaiModule.generateUpdatedEpic).mockResolvedValue({ data: mockEpic });

    const { result } = renderHook(() => useWorkItemUpdate('epics'), { wrapper });

    await act(async () => {
      await result.current.generateUpdatedWorkItem({
        context: 'test context',
        state: {
          sow: {
            globalInformation: 'info',
            selectedModel: 'gpt-4',
            chatApi: 'api',
            id: 'test',
            apps: {},
            epics: {},
            features: {},
            userStories: {},
            tasks: {},
            contextualQuestions: [],
          },
        } as Parameters<typeof result.current.generateUpdatedWorkItem>[0]['state'],
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.updatedWorkItem).toEqual(mockEpic);
    });
  });

  it('handles generateUpdatedFeature call', async () => {
    const mockFeature = { id: 'feature-1', title: 'Updated Feature' };
    vi.mocked(openaiModule.generateUpdatedFeature).mockResolvedValue({ data: mockFeature });

    const { result } = renderHook(() => useWorkItemUpdate('features'), { wrapper });

    const mockEpic = {
      id: 'epic-1',
      documentId: 'epic-1',
      title: 'Test Epic',
      description: '',
      goal: '',
      successCriteria: '',
      dependencies: '',
      timeline: '',
      resources: '',
      featureIds: [],
      risksAndMitigation: [],
      contextualQuestions: [],
    };

    await act(async () => {
      await result.current.generateUpdatedWorkItem({
        context: 'test context',
        epic: mockEpic,
        state: {
          sow: {
            globalInformation: 'info',
            selectedModel: 'gpt-4',
            chatApi: 'api',
            id: 'test',
            apps: {},
            epics: {},
            features: {},
            userStories: {},
            tasks: {},
            contextualQuestions: [],
          },
        } as Parameters<typeof result.current.generateUpdatedWorkItem>[0]['state'],
      });
    });

    await waitFor(() => {
      expect(result.current.updatedWorkItem).toEqual(mockFeature);
    });
  });

  it('handles error during generation', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(openaiModule.generateUpdatedEpic).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useWorkItemUpdate('epics'), { wrapper });

    await act(async () => {
      await result.current.generateUpdatedWorkItem({
        context: 'test context',
        state: {
          sow: {
            globalInformation: 'info',
            selectedModel: 'gpt-4',
            chatApi: 'api',
            id: 'test',
            apps: {},
            epics: {},
            features: {},
            userStories: {},
            tasks: {},
            contextualQuestions: [],
          },
        } as Parameters<typeof result.current.generateUpdatedWorkItem>[0]['state'],
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to generate updated work item.');
      expect(result.current.loading).toBe(false);
    });

    consoleSpy.mockRestore();
  });

  it('handles invalid work item type', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // @ts-expect-error - Testing invalid type
    const { result } = renderHook(() => useWorkItemUpdate('invalid'), { wrapper });

    await act(async () => {
      await result.current.generateUpdatedWorkItem({
        context: 'test context',
        state: {
          sow: {
            globalInformation: 'info',
            selectedModel: 'gpt-4',
            chatApi: 'api',
            id: 'test',
            apps: {},
            epics: {},
            features: {},
            userStories: {},
            tasks: {},
            contextualQuestions: [],
          },
        } as Parameters<typeof result.current.generateUpdatedWorkItem>[0]['state'],
      });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to generate updated work item.');
    });

    consoleSpy.mockRestore();
  });
});
