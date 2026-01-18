/**
 * Tests for useQuestionGeneration hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import sowReducer from '../../../../lib/store/sow-slice';
import useQuestionGeneration from './use-question-generation';
import type {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  ContextualQuestion,
} from '../types/work-items';

// Mock the openai API functions
vi.mock('../api/openai', () => ({
  generateQuestionsForEpic: vi.fn(),
  generateQuestionsForFeature: vi.fn(),
  generateQuestionsForUserStory: vi.fn(),
  generateQuestionsForTask: vi.fn(),
  generateQuestionsForGlobalRefinement: vi.fn(),
}));

// Mock generate-id
vi.mock('../utils/generate-id', () => ({
  default: vi.fn(() => 'mock-id-123'),
}));

// Mock logger
vi.mock('../../../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn(),
  },
}));

// Default Redux state
const defaultSowState = {
  chatApi: 'openai',
  selectedModel: 'gpt-4',
  epics: {},
  features: {},
  userStories: {},
  tasks: {},
  globalInformation: '',
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

describe('useQuestionGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('initializes with default empty questions array', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.questions).toEqual([]);
    });

    it('initializes with provided initial questions', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'Question 1' },
        { id: 'q2', question: 'Question 2' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      expect(result.current.questions).toEqual(initialQuestions);
    });

    it('returns all expected functions', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      expect(typeof result.current.generateQuestions).toBe('function');
      expect(typeof result.current.addQuestion).toBe('function');
      expect(typeof result.current.removeQuestion).toBe('function');
      expect(typeof result.current.updateQuestion).toBe('function');
      expect(typeof result.current.setQuestions).toBe('function');
    });
  });

  describe('generateQuestions', () => {
    it('generates questions for epics', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Question 1=+=Question 2=+=Question 3',
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(generateQuestionsForEpic).toHaveBeenCalledWith({
        chatApi: 'openai',
        epic: mockEpic,
        selectedModel: 'gpt-4',
      });
      expect(result.current.questions.length).toBe(3);
      expect(result.current.loading).toBe(false);
    });

    it('generates questions for features', async () => {
      const store = createTestStore();
      const { generateQuestionsForFeature } = await import('../api/openai');
      vi.mocked(generateQuestionsForFeature).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Feature Question 1=+=Feature Question 2',
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('features'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockFeature);
      });

      expect(generateQuestionsForFeature).toHaveBeenCalledWith({
        chatApi: 'openai',
        feature: mockFeature,
        selectedModel: 'gpt-4',
      });
      expect(result.current.questions.length).toBe(2);
    });

    it('generates questions for user stories', async () => {
      const store = createTestStore();
      const { generateQuestionsForUserStory } = await import('../api/openai');
      vi.mocked(generateQuestionsForUserStory).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'User Story Question',
              },
            },
          ],
        },
      });

      const { result } = renderHook(
        () => useQuestionGeneration('userStories'),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.generateQuestions(mockUserStory);
      });

      expect(generateQuestionsForUserStory).toHaveBeenCalledWith({
        chatApi: 'openai',
        userStory: mockUserStory,
        selectedModel: 'gpt-4',
      });
      expect(result.current.questions.length).toBe(1);
    });

    it('generates questions for tasks', async () => {
      const store = createTestStore();
      const { generateQuestionsForTask } = await import('../api/openai');
      vi.mocked(generateQuestionsForTask).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Task Question 1=+=Task Question 2',
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('tasks'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockTask);
      });

      expect(generateQuestionsForTask).toHaveBeenCalledWith({
        chatApi: 'openai',
        task: mockTask,
        selectedModel: 'gpt-4',
      });
      expect(result.current.questions.length).toBe(2);
    });

    it('generates questions for global refinement', async () => {
      const store = createTestStore();
      const { generateQuestionsForGlobalRefinement } = await import(
        '../api/openai'
      );
      vi.mocked(generateQuestionsForGlobalRefinement).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Global Question 1=+=Global Question 2',
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('Global'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions('Some global information');
      });

      expect(generateQuestionsForGlobalRefinement).toHaveBeenCalledWith({
        chatApi: 'openai',
        globalInformation: 'Some global information',
        selectedModel: 'gpt-4',
      });
      expect(result.current.questions.length).toBe(2);
    });

    it('sets loading state during question generation', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');

      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(generateQuestionsForEpic).mockReturnValueOnce(
        pendingPromise as never
      );

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      let generationPromise: Promise<ContextualQuestion[] | null>;
      await act(async () => {
        generationPromise = result.current.generateQuestions(mockEpic);
      });

      // Loading should be true while waiting
      expect(result.current.loading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          data: {
            choices: [{ message: { content: 'Question' } }],
          },
        });
        await generationPromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('handles single question without delimiter', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'This is a single question without delimiter',
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(result.current.questions.length).toBe(1);
      expect(result.current.questions[0].question).toBe(
        'This is a single question without delimiter'
      );
    });

    it('filters out empty questions after splitting', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Question 1=+==+=Question 2=+=  =+=Question 3',
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      // Should only have 3 valid questions (empty ones filtered out)
      expect(result.current.questions.length).toBe(3);
    });

    it('returns parsed questions on success', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Question 1=+=Question 2',
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      let returnedQuestions: ContextualQuestion[] | null = null;
      await act(async () => {
        returnedQuestions = await result.current.generateQuestions(mockEpic);
      });

      expect(returnedQuestions).not.toBeNull();
      expect(returnedQuestions!.length).toBe(2);
      expect(returnedQuestions![0].question).toBe('Question 1');
      expect(returnedQuestions![1].question).toBe('Question 2');
    });
  });

  describe('error handling', () => {
    it('handles invalid work item type', async () => {
      const store = createTestStore();
      const { result } = renderHook(
        () => useQuestionGeneration('invalidType' as never),
        { wrapper: createWrapper(store) }
      );

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(result.current.error).toContain('Invalid work item type');
      expect(result.current.loading).toBe(false);
    });

    it('handles API error', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockRejectedValueOnce(
        new Error('API connection failed')
      );

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(result.current.error).toContain('API connection failed');
      expect(result.current.loading).toBe(false);
    });

    it('handles non-Error thrown values', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockRejectedValueOnce(
        'String error message'
      );

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(result.current.error).toBe(
        'Failed to generate questions. Please try again.'
      );
    });

    it('handles invalid response format - missing content', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: null,
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(result.current.error).toContain('Invalid response format');
    });

    it('handles no valid questions generated', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: '   ',
              },
            },
          ],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(result.current.error).toContain('No valid questions generated');
    });

    it('returns null on error', async () => {
      const store = createTestStore();
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockRejectedValueOnce(
        new Error('API Error')
      );

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      let returnedQuestions: ContextualQuestion[] | null = 'not-null' as never;
      await act(async () => {
        returnedQuestions = await result.current.generateQuestions(mockEpic);
      });

      expect(returnedQuestions).toBeNull();
    });

    it('logs error with logger', async () => {
      const store = createTestStore();
      const { logger } = await import('../../../../lib/logger');
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockRejectedValueOnce(
        new Error('API Error')
      );

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to generate questions:',
        expect.any(Error)
      );
    });
  });

  describe('addQuestion', () => {
    it('adds a new question to the list', () => {
      const store = createTestStore();
      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      const newQuestion: ContextualQuestion = {
        id: 'new-q',
        question: 'New question?',
      };

      act(() => {
        result.current.addQuestion(newQuestion);
      });

      expect(result.current.questions).toContainEqual(newQuestion);
      expect(result.current.questions.length).toBe(1);
    });

    it('appends question to existing questions', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'Existing question' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      const newQuestion: ContextualQuestion = {
        id: 'q2',
        question: 'New question?',
      };

      act(() => {
        result.current.addQuestion(newQuestion);
      });

      expect(result.current.questions.length).toBe(2);
      expect(result.current.questions[1]).toEqual(newQuestion);
    });
  });

  describe('removeQuestion', () => {
    it('removes question at specified index', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'Question 1' },
        { id: 'q2', question: 'Question 2' },
        { id: 'q3', question: 'Question 3' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.removeQuestion(1);
      });

      expect(result.current.questions.length).toBe(2);
      expect(result.current.questions).toEqual([
        { id: 'q1', question: 'Question 1' },
        { id: 'q3', question: 'Question 3' },
      ]);
    });

    it('removes first question when index is 0', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'First' },
        { id: 'q2', question: 'Second' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.removeQuestion(0);
      });

      expect(result.current.questions.length).toBe(1);
      expect(result.current.questions[0].question).toBe('Second');
    });

    it('removes last question when index is last', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'First' },
        { id: 'q2', question: 'Last' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.removeQuestion(1);
      });

      expect(result.current.questions.length).toBe(1);
      expect(result.current.questions[0].question).toBe('First');
    });
  });

  describe('updateQuestion', () => {
    it('updates question at specified index', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'Old question' },
        { id: 'q2', question: 'Another question' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      const updatedQuestion: ContextualQuestion = {
        id: 'q1',
        question: 'Updated question',
        answer: 'Some answer',
      };

      act(() => {
        result.current.updateQuestion(0, updatedQuestion);
      });

      expect(result.current.questions[0]).toEqual(updatedQuestion);
      expect(result.current.questions.length).toBe(2);
    });

    it('preserves other questions when updating', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'Question 1' },
        { id: 'q2', question: 'Question 2' },
        { id: 'q3', question: 'Question 3' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.updateQuestion(1, {
          id: 'q2',
          question: 'Updated Q2',
        });
      });

      expect(result.current.questions[0].question).toBe('Question 1');
      expect(result.current.questions[1].question).toBe('Updated Q2');
      expect(result.current.questions[2].question).toBe('Question 3');
    });
  });

  describe('setQuestions', () => {
    it('replaces all questions with new array', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'Old question' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      const newQuestions: ContextualQuestion[] = [
        { id: 'new1', question: 'New question 1' },
        { id: 'new2', question: 'New question 2' },
      ];

      act(() => {
        result.current.setQuestions(newQuestions);
      });

      expect(result.current.questions).toEqual(newQuestions);
    });

    it('clears questions when set to empty array', () => {
      const store = createTestStore();
      const initialQuestions: ContextualQuestion[] = [
        { id: 'q1', question: 'Question' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper: createWrapper(store) }
      );

      act(() => {
        result.current.setQuestions([]);
      });

      expect(result.current.questions).toEqual([]);
    });
  });

  describe('Redux integration', () => {
    it('uses chatApi from Redux store', async () => {
      const store = createTestStore({ chatApi: 'custom-api' });
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'Question' } }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(generateQuestionsForEpic).toHaveBeenCalledWith(
        expect.objectContaining({
          chatApi: 'custom-api',
        })
      );
    });

    it('uses selectedModel from Redux store', async () => {
      const store = createTestStore({ selectedModel: 'gpt-3.5-turbo' });
      const { generateQuestionsForEpic } = await import('../api/openai');
      vi.mocked(generateQuestionsForEpic).mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'Question' } }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.generateQuestions(mockEpic);
      });

      expect(generateQuestionsForEpic).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedModel: 'gpt-3.5-turbo',
        })
      );
    });
  });
});
