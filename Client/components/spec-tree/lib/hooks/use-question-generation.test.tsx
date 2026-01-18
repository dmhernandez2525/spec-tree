import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock the openai module
vi.mock('../api/openai', () => ({
  generateQuestionsForEpic: vi.fn(),
  generateQuestionsForFeature: vi.fn(),
  generateQuestionsForUserStory: vi.fn(),
  generateQuestionsForTask: vi.fn(),
  generateQuestionsForGlobalRefinement: vi.fn(),
}));

// Mock generate-id
vi.mock('../utils/generate-id', () => ({
  default: vi.fn(() => 'mock-id'),
}));

// Mock logger
vi.mock('../../../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
}));

import useQuestionGeneration from './use-question-generation';
import * as openaiModule from '../api/openai';

describe('useQuestionGeneration', () => {
  const createTestStore = () =>
    configureStore({
      reducer: {
        sow: () => ({
          chatApi: 'mock-api',
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
    const { result } = renderHook(() => useQuestionGeneration('epics'), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.questions).toEqual([]);
  });

  it('initializes with provided initial questions', () => {
    const initialQuestions = [
      { id: 'q1', question: 'Question 1?' },
      { id: 'q2', question: 'Question 2?' },
    ];

    const { result } = renderHook(
      () => useQuestionGeneration('epics', initialQuestions),
      { wrapper }
    );

    expect(result.current.questions).toEqual(initialQuestions);
  });

  it('provides expected functions', () => {
    const { result } = renderHook(() => useQuestionGeneration('epics'), { wrapper });

    expect(typeof result.current.generateQuestions).toBe('function');
    expect(typeof result.current.addQuestion).toBe('function');
    expect(typeof result.current.removeQuestion).toBe('function');
    expect(typeof result.current.updateQuestion).toBe('function');
    expect(typeof result.current.setQuestions).toBe('function');
  });

  describe('addQuestion', () => {
    it('adds a question to the list', () => {
      const { result } = renderHook(() => useQuestionGeneration('epics'), { wrapper });

      act(() => {
        result.current.addQuestion({ id: 'new-q', question: 'New question?' });
      });

      expect(result.current.questions).toEqual([
        { id: 'new-q', question: 'New question?' },
      ]);
    });

    it('appends to existing questions', () => {
      const { result } = renderHook(
        () => useQuestionGeneration('epics', [{ id: 'q1', question: 'Q1?' }]),
        { wrapper }
      );

      act(() => {
        result.current.addQuestion({ id: 'q2', question: 'Q2?' });
      });

      expect(result.current.questions).toHaveLength(2);
    });
  });

  describe('removeQuestion', () => {
    it('removes a question at specified index', () => {
      const initialQuestions = [
        { id: 'q1', question: 'Q1?' },
        { id: 'q2', question: 'Q2?' },
        { id: 'q3', question: 'Q3?' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper }
      );

      act(() => {
        result.current.removeQuestion(1);
      });

      expect(result.current.questions).toEqual([
        { id: 'q1', question: 'Q1?' },
        { id: 'q3', question: 'Q3?' },
      ]);
    });
  });

  describe('updateQuestion', () => {
    it('updates a question at specified index', () => {
      const initialQuestions = [
        { id: 'q1', question: 'Old question?' },
      ];

      const { result } = renderHook(
        () => useQuestionGeneration('epics', initialQuestions),
        { wrapper }
      );

      act(() => {
        result.current.updateQuestion(0, { id: 'q1', question: 'Updated question?' });
      });

      expect(result.current.questions[0].question).toBe('Updated question?');
    });
  });

  describe('generateQuestions', () => {
    it('sets loading to true when generating', async () => {
      vi.mocked(openaiModule.generateQuestionsForEpic).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    choices: [{ message: { content: 'Question 1?=+=Question 2?' } }],
                  },
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useQuestionGeneration('epics'), { wrapper });

      act(() => {
        result.current.generateQuestions({ id: 'epic-1', title: 'Test Epic' });
      });

      expect(result.current.loading).toBe(true);
    });

    it('parses questions with delimiter', async () => {
      vi.mocked(openaiModule.generateQuestionsForEpic).mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Question 1?=+=Question 2?=+=Question 3?' } }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), { wrapper });

      await act(async () => {
        await result.current.generateQuestions({ id: 'epic-1', title: 'Test Epic' });
      });

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(3);
        expect(result.current.loading).toBe(false);
      });
    });

    it('handles response without delimiter as single question', async () => {
      vi.mocked(openaiModule.generateQuestionsForEpic).mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Single question without delimiter?' } }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), { wrapper });

      await act(async () => {
        await result.current.generateQuestions({ id: 'epic-1', title: 'Test Epic' });
      });

      await waitFor(() => {
        expect(result.current.questions).toHaveLength(1);
      });
    });

    it('handles error during generation', async () => {
      vi.mocked(openaiModule.generateQuestionsForEpic).mockRejectedValue(
        new Error('API Error')
      );

      const { result } = renderHook(() => useQuestionGeneration('epics'), { wrapper });

      await act(async () => {
        await result.current.generateQuestions({ id: 'epic-1', title: 'Test Epic' });
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Failed to generate questions');
        expect(result.current.loading).toBe(false);
      });
    });

    it('calls correct API for features', async () => {
      vi.mocked(openaiModule.generateQuestionsForFeature).mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Feature question?' } }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('features'), { wrapper });

      await act(async () => {
        await result.current.generateQuestions({ id: 'feature-1', title: 'Test Feature' });
      });

      expect(openaiModule.generateQuestionsForFeature).toHaveBeenCalled();
    });

    it('calls correct API for userStories', async () => {
      vi.mocked(openaiModule.generateQuestionsForUserStory).mockResolvedValue({
        data: {
          choices: [{ message: { content: 'User story question?' } }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('userStories'), { wrapper });

      await act(async () => {
        await result.current.generateQuestions({ id: 'story-1', title: 'Test Story' });
      });

      expect(openaiModule.generateQuestionsForUserStory).toHaveBeenCalled();
    });

    it('calls correct API for tasks', async () => {
      vi.mocked(openaiModule.generateQuestionsForTask).mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Task question?' } }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('tasks'), { wrapper });

      await act(async () => {
        await result.current.generateQuestions({ id: 'task-1', title: 'Test Task' });
      });

      expect(openaiModule.generateQuestionsForTask).toHaveBeenCalled();
    });

    it('calls correct API for Global refinement', async () => {
      vi.mocked(openaiModule.generateQuestionsForGlobalRefinement).mockResolvedValue({
        data: {
          choices: [{ message: { content: 'Global question?' } }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('Global'), { wrapper });

      await act(async () => {
        await result.current.generateQuestions('Global information text');
      });

      expect(openaiModule.generateQuestionsForGlobalRefinement).toHaveBeenCalled();
    });

    it('handles invalid response format', async () => {
      vi.mocked(openaiModule.generateQuestionsForEpic).mockResolvedValue({
        data: {
          choices: [{ message: {} }],
        },
      });

      const { result } = renderHook(() => useQuestionGeneration('epics'), { wrapper });

      await act(async () => {
        await result.current.generateQuestions({ id: 'epic-1', title: 'Test Epic' });
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Invalid response format');
      });
    });
  });
});
