import { describe, it, expect, vi } from 'vitest';

// Mock the store selectors
vi.mock('../../../../lib/store/sow-slice', () => ({
  selectFeatureById: vi.fn((state, id) => state.sow?.features?.[id] || null),
  selectUserStoryById: vi.fn((state, id) => state.sow?.userStories?.[id] || null),
  selectTaskById: vi.fn((state, id) => state.sow?.tasks?.[id] || null),
}));

// Mock context-propagation
vi.mock('../utils/context-propagation', () => ({
  buildEpicContext: vi.fn(() => 'epic context'),
  buildFeatureContext: vi.fn(() => 'feature context'),
  buildUserStoryContext: vi.fn(() => 'user story context'),
}));

import {
  epicPrompt,
  featurePrompt,
  userStoryPrompt,
  taskPrompt,
  generateAdditionalEpicsPrompt,
  generateAdditionalFeaturesPrompt,
  generateAdditionalUserStoriesPrompt,
  generateAdditionalTasksPrompt,
  generateContextQuestionsForEpic,
  generateContextQuestionsForFeature,
  generateContextQuestionsForUserStory,
  generateContextQuestionsForTask,
  generateContextQuestionsForGlobalRefinement,
  generateExplanationForGlobalRefinement,
} from './prompts';

describe('prompts', () => {
  const mockState = {
    sow: {
      features: {
        'feature-1': { id: 'feature-1', title: 'Feature 1' },
      },
      userStories: {
        'story-1': { id: 'story-1', title: 'Story 1' },
      },
      tasks: {
        'task-1': { id: 'task-1', title: 'Task 1' },
      },
      epics: {
        'epic-1': { id: 'epic-1', title: 'Epic 1' },
      },
      globalInformation: 'Global project information',
    },
  };

  const mockEpic = {
    id: 'epic-1',
    documentId: 'epic-1',
    title: 'Test Epic',
    description: 'Epic description',
    goal: 'Epic goal',
    successCriteria: 'Success criteria',
    dependencies: 'Dependencies',
    timeline: 'Q1 2024',
    resources: 'Dev team',
    risksAndMitigation: [],
    featureIds: ['feature-1'],
    contextualQuestions: [],
  };

  const mockFeature = {
    id: 'feature-1',
    documentId: 'feature-1',
    title: 'Test Feature',
    description: 'Feature description',
    details: 'Feature details',
    dependencies: 'Feature deps',
    acceptanceCriteria: [{ text: 'AC 1' }],
    parentEpicId: 'epic-1',
    userStoryIds: ['story-1'],
    contextualQuestions: [],
  };

  const mockUserStory = {
    id: 'story-1',
    documentId: 'story-1',
    title: 'Test Story',
    role: 'User',
    action: 'do something',
    goal: 'achieve goal',
    points: 5,
    acceptanceCriteria: [{ text: 'AC' }],
    parentFeatureId: 'feature-1',
    taskIds: ['task-1'],
    developmentOrder: 1,
    dependentUserStoryIds: [],
    contextualQuestions: [],
  };

  const mockTask = {
    id: 'task-1',
    documentId: 'task-1',
    title: 'Test Task',
    details: 'Task details',
    priority: 'high',
    parentUserStoryId: 'story-1',
    dependentTaskIds: [],
    contextualQuestions: [],
  };

  describe('epicPrompt', () => {
    it('generates epic prompt with requirements', () => {
      const result = epicPrompt('Build a todo app');

      expect(result).toContain('Build a todo app');
      expect(result).toContain('Epic');
      expect(result).toContain('JSON');
    });

    it('includes context when provided', () => {
      const result = epicPrompt('Build a todo app', 'Additional info');

      expect(result).toContain('Additional Context: Additional info');
    });

    it('excludes context section when not provided', () => {
      const result = epicPrompt('Build a todo app');

      expect(result).not.toContain('Additional Context:');
    });
  });

  describe('featurePrompt', () => {
    it('generates feature prompt from epic', () => {
      const result = featurePrompt(mockEpic, mockState as any);

      expect(result).toContain(mockEpic.title);
      expect(result).toContain(mockEpic.description);
    });

    it('includes context when provided', () => {
      const result = featurePrompt(mockEpic, mockState as any, 'Extra context');

      expect(result).toContain('Additional Context: Extra context');
    });
  });

  describe('userStoryPrompt', () => {
    it('generates user story prompt from feature', () => {
      const result = userStoryPrompt(mockFeature, mockState as any);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes context when provided', () => {
      const result = userStoryPrompt(mockFeature, mockState as any, 'Story context');

      expect(result).toContain('Additional Context: Story context');
    });
  });

  describe('taskPrompt', () => {
    it('generates task prompt from user story', () => {
      const result = taskPrompt(mockUserStory, mockState as any);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes context when provided', () => {
      const result = taskPrompt(mockUserStory, mockState as any, 'Task context');

      expect(result).toContain('Additional Context: Task context');
    });
  });

  describe('generateAdditionalEpicsPrompt', () => {
    it('generates additional epics prompt', () => {
      const result = generateAdditionalEpicsPrompt({
        state: mockState as any,
      });

      expect(typeof result).toBe('string');
      expect(result).toContain('Global project information');
    });
  });

  describe('generateAdditionalFeaturesPrompt', () => {
    it('generates additional features prompt', () => {
      const result = generateAdditionalFeaturesPrompt(mockEpic, mockState as any);

      expect(result).toContain(mockEpic.title);
    });
  });

  describe('generateAdditionalUserStoriesPrompt', () => {
    it('generates additional user stories prompt', () => {
      const result = generateAdditionalUserStoriesPrompt(mockFeature, mockState as any);

      expect(typeof result).toBe('string');
    });
  });

  describe('generateAdditionalTasksPrompt', () => {
    it('generates additional tasks prompt', () => {
      const result = generateAdditionalTasksPrompt(mockUserStory, mockState as any);

      expect(typeof result).toBe('string');
    });
  });

  describe('generateContextQuestionsForEpic', () => {
    it('generates questions prompt for epic', () => {
      const result = generateContextQuestionsForEpic(mockEpic);

      expect(result).toContain(mockEpic.title);
    });
  });

  describe('generateContextQuestionsForFeature', () => {
    it('generates questions prompt for feature', () => {
      const result = generateContextQuestionsForFeature(mockFeature);

      expect(result).toContain(mockFeature.title);
    });
  });

  describe('generateContextQuestionsForUserStory', () => {
    it('generates questions prompt for user story', () => {
      const result = generateContextQuestionsForUserStory(mockUserStory);

      expect(result).toContain(mockUserStory.title);
    });
  });

  describe('generateContextQuestionsForTask', () => {
    it('generates questions prompt for task', () => {
      const result = generateContextQuestionsForTask(mockTask);

      expect(result).toContain(mockTask.title);
    });
  });

  describe('generateContextQuestionsForGlobalRefinement', () => {
    it('generates questions for global information', () => {
      const result = generateContextQuestionsForGlobalRefinement('Project requirements');

      expect(result).toContain('Project requirements');
    });
  });

  describe('generateExplanationForGlobalRefinement', () => {
    it('generates explanation for global refinement', () => {
      const result = generateExplanationForGlobalRefinement('Project info');

      expect(result).toContain('Project info');
    });
  });
});
