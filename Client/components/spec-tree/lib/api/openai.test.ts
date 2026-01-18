import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateAdditionalFeatures,
  generateAdditionalEpics,
  generateUserStories,
  askQuestion,
  generateTasks,
  generateQuestionsForEpic,
  generateQuestionsForFeature,
  generateQuestionsForUserStory,
  generateQuestionsForTask,
  generateFollowUpQuestions,
  generateUpdatedEpic,
  generateUpdatedFeature,
  generateUpdatedUserStory,
  generateUpdatedTask,
  generateQuestionsForGlobalRefinement,
  generateUpdatedExplanationForGlobalRefinement,
} from './openai';
import type { RootState } from '../../../../lib/store';
import type {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';

vi.mock('./openai-proxy-helper', () => ({
  makeProxyCall: vi.fn(),
}));

vi.mock('../constants/prompts', () => ({
  generateContextQuestionsForEpic: vi.fn((epic) => `Questions for epic: ${epic.title}`),
  generateContextQuestionsForFeature: vi.fn((feature) => `Questions for feature: ${feature.title}`),
  generateContextQuestionsForUserStory: vi.fn((story) => `Questions for story: ${story.title}`),
  generateContextQuestionsForTask: vi.fn((task) => `Questions for task: ${task.title}`),
  generateAdditionalEpicsPrompt: vi.fn(() => 'Generate additional epics'),
  generateAdditionalFeaturesPrompt: vi.fn((epic) => `Generate features for ${epic.title}`),
  generateAdditionalUserStoriesPrompt: vi.fn((feature) => `Generate stories for ${feature.title}`),
  generateAdditionalTasksPrompt: vi.fn((story) => `Generate tasks for ${story.title}`),
  epicPrompt: vi.fn((req, ctx) => `Epic prompt: ${req} ${ctx || ''}`),
  featurePrompt: vi.fn((epic, state, ctx) => `Feature prompt: ${epic.title} ${ctx || ''}`),
  userStoryPrompt: vi.fn((feature, state, ctx) => `User story prompt: ${feature.title} ${ctx || ''}`),
  taskPrompt: vi.fn((story, state, ctx) => `Task prompt: ${story.title} ${ctx || ''}`),
  generateContextQuestionsForGlobalRefinement: vi.fn((info) => `Global questions: ${info}`),
  generateExplanationForGlobalRefinement: vi.fn((info, ctx) => `Global explanation: ${info} ${ctx}`),
}));

import { makeProxyCall } from './openai-proxy-helper';

describe('openai API', () => {
  const mockState: RootState = {
    sow: {
      epics: {},
      features: {},
      userStories: {},
      tasks: {},
      contextualQuestions: [],
      globalInformation: 'Test global info',
      selectedModel: 'gpt-4',
      chatApi: 'test',
      id: 'test-id',
      apps: {},
    },
  } as RootState;

  const mockEpic: EpicType = {
    id: 'epic-1',
    title: 'Test Epic',
    description: 'Epic description',
    goal: 'Epic goal',
    successCriteria: 'Success criteria',
    dependencies: 'Dependencies',
    timeline: 'Timeline',
    resources: 'Resources',
    risksAndMitigation: [],
    featureIds: [],
    parentAppId: 'app-1',
    notes: 'Notes',
  };

  const mockFeature: FeatureType = {
    id: 'feature-1',
    title: 'Test Feature',
    description: 'Feature description',
    details: 'Feature details',
    acceptanceCriteria: [{ text: 'AC 1' }],
    parentEpicId: 'epic-1',
    userStoryIds: [],
    notes: 'Notes',
    priority: 'High',
    effort: 'Medium',
  };

  const mockUserStory: UserStoryType = {
    id: 'story-1',
    title: 'Test Story',
    role: 'User',
    action: 'Action',
    goal: 'Goal',
    points: '5',
    acceptanceCriteria: [{ text: 'AC 1' }],
    notes: 'Notes',
    parentFeatureId: 'feature-1',
    taskIds: [],
    developmentOrder: 1,
  };

  const mockTask: TaskType = {
    id: 'task-1',
    title: 'Test Task',
    details: 'Task details',
    priority: 1,
    notes: 'Notes',
    parentUserStoryId: 'story-1',
    dependentTaskIds: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAdditionalFeatures', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Features' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateAdditionalFeatures({
        epic: mockEpic,
        state: mockState,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI model trained to generate additional features and user stories for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate additional features',
      });
    });

    it('uses context when provided', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Features' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateAdditionalFeatures({
        epic: mockEpic,
        state: mockState,
        selectedModel: 'gpt-4',
        context: 'Custom context',
      });

      expect(makeProxyCall).toHaveBeenCalledWith(
        expect.objectContaining({
          userPrompt: 'Custom context',
        })
      );
    });

    it('throws error when makeProxyCall fails', async () => {
      vi.mocked(makeProxyCall).mockRejectedValue(new Error('API Error'));

      await expect(
        generateAdditionalFeatures({
          epic: mockEpic,
          state: mockState,
          selectedModel: 'gpt-4',
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('generateAdditionalEpics', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Epics' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateAdditionalEpics({
        state: mockState,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI model trained to generate additional epics for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate additional epics',
      });
    });
  });

  describe('generateUserStories', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Stories' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUserStories({
        feature: mockFeature,
        state: mockState,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI model trained to generate additional features and user stories for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate user stories',
      });
    });

    it('uses context when provided', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Stories' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUserStories({
        feature: mockFeature,
        state: mockState,
        selectedModel: 'gpt-4',
        context: 'Custom context',
      });

      expect(makeProxyCall).toHaveBeenCalledWith(
        expect.objectContaining({
          userPrompt: 'Custom context',
        })
      );
    });
  });

  describe('askQuestion', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Answer' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await askQuestion({
        question: 'What is this?',
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI model trained to generate information.',
        userPrompt: 'What is this?',
        selectedModel: 'gpt-4',
        errorContext: 'answer question',
      });
    });
  });

  describe('generateTasks', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Tasks' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateTasks({
        userStory: mockUserStory,
        state: mockState,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI model trained to generate tasks for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate tasks',
      });
    });

    it('uses context when provided', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Tasks' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateTasks({
        userStory: mockUserStory,
        state: mockState,
        selectedModel: 'gpt-4',
        context: 'Custom context',
      });

      expect(makeProxyCall).toHaveBeenCalledWith(
        expect.objectContaining({
          userPrompt: 'Custom context',
        })
      );
    });
  });

  describe('generateQuestionsForEpic', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Questions' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateQuestionsForEpic({
        epic: mockEpic,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate contextual questions for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate epic questions',
      });
    });
  });

  describe('generateQuestionsForFeature', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Questions' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateQuestionsForFeature({
        feature: mockFeature,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate contextual questions for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate feature questions',
      });
    });
  });

  describe('generateQuestionsForUserStory', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Questions' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateQuestionsForUserStory({
        userStory: mockUserStory,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate contextual questions for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate user story questions',
      });
    });
  });

  describe('generateQuestionsForTask', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Questions' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateQuestionsForTask({
        task: mockTask,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate contextual questions for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate task questions',
      });
    });
  });

  describe('generateFollowUpQuestions', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Follow-up questions' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateFollowUpQuestions({
        context: 'Some context',
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate follow-up questions based on given context and answers.',
        userPrompt: 'Some context',
        selectedModel: 'gpt-4',
        errorContext: 'generate follow-up questions',
      });
    });
  });

  describe('generateUpdatedEpic', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Updated epic' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUpdatedEpic({
        requirements: 'Requirements',
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate updated epics based on given context and answers.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate updated epic',
      });
    });

    it('uses context when provided', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Updated epic' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUpdatedEpic({
        requirements: 'Requirements',
        selectedModel: 'gpt-4',
        context: 'Custom context',
      });

      expect(makeProxyCall).toHaveBeenCalled();
    });
  });

  describe('generateUpdatedFeature', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Updated feature' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUpdatedFeature({
        epic: mockEpic,
        state: mockState,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate updated features based on given context and answers.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate updated feature',
      });
    });

    it('uses context when provided', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Updated feature' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUpdatedFeature({
        epic: mockEpic,
        state: mockState,
        selectedModel: 'gpt-4',
        context: 'Custom context',
      });

      expect(makeProxyCall).toHaveBeenCalled();
    });
  });

  describe('generateUpdatedUserStory', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Updated story' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUpdatedUserStory({
        feature: mockFeature,
        state: mockState,
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate updated user stories based on given context and answers.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate updated user story',
      });
    });

    it('uses context when provided', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Updated story' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUpdatedUserStory({
        feature: mockFeature,
        state: mockState,
        selectedModel: 'gpt-4',
        context: 'Custom context',
      });

      expect(makeProxyCall).toHaveBeenCalled();
    });
  });

  describe('generateUpdatedTask', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Updated task' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateUpdatedTask({
        userStory: mockUserStory,
        state: mockState,
        context: 'Context',
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate updated tasks based on given context and answers.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate updated task',
      });
    });
  });

  describe('generateQuestionsForGlobalRefinement', () => {
    it('calls makeProxyCall with correct parameters', async () => {
      const mockResponse = { data: { choices: [{ message: { content: 'Global questions' } }] } };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await generateQuestionsForGlobalRefinement({
        globalInformation: 'Global info',
        selectedModel: 'gpt-4',
      });

      expect(makeProxyCall).toHaveBeenCalledWith({
        systemPrompt: 'You are an AI trained to generate contextual questions for software development projects.',
        userPrompt: expect.any(String),
        selectedModel: 'gpt-4',
        errorContext: 'generate global refinement questions',
      });
    });
  });

  describe('generateUpdatedExplanationForGlobalRefinement', () => {
    it('extracts content between separators', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Some text =+= Extracted Content =+= More text'
            }
          }]
        }
      };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      const result = await generateUpdatedExplanationForGlobalRefinement({
        globalInformation: 'Global info',
        context: 'Context',
        selectedModel: 'gpt-4',
      });

      expect(result).toBe('Extracted Content');
    });

    it('throws error when content is missing', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: null
            }
          }]
        }
      };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await expect(
        generateUpdatedExplanationForGlobalRefinement({
          globalInformation: 'Global info',
          context: 'Context',
          selectedModel: 'gpt-4',
        })
      ).rejects.toThrow('Invalid response format: missing content');
    });

    it('throws error when separators are missing', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Content without separators'
            }
          }]
        }
      };
      vi.mocked(makeProxyCall).mockResolvedValue(mockResponse);

      await expect(
        generateUpdatedExplanationForGlobalRefinement({
          globalInformation: 'Global info',
          context: 'Context',
          selectedModel: 'gpt-4',
        })
      ).rejects.toThrow('Invalid response format: missing separators');
    });

    it('handles errors from makeProxyCall', async () => {
      vi.mocked(makeProxyCall).mockRejectedValue(new Error('Network error'));

      await expect(
        generateUpdatedExplanationForGlobalRefinement({
          globalInformation: 'Global info',
          context: 'Context',
          selectedModel: 'gpt-4',
        })
      ).rejects.toThrow('Network error');
    });
  });
});
