/**
 * Tests for Copilot Export
 *
 * F2.1.5 - GitHub Copilot Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportCopilotInstructions,
  exportTaskAsWRAP,
  exportUserStoryTasksAsWRAP,
  exportFeatureTasksAsWRAP,
  exportEpicTasksAsWRAP,
  copyCopilotToClipboard,
  getWRAPStatistics,
  CopilotExportOptions,
} from './copilot-export';
import { RootState } from '@/lib/store';
import { EpicType, FeatureType, UserStoryType, TaskType } from '../types/work-items';

// Partial type for mock slices
type MockSlice<T> = Partial<T>;

// Helper to create a mock RootState
function createMockState(overrides: Partial<RootState['sow']> = {}): RootState {
  return {
    sow: {
      epics: {},
      features: {},
      userStories: {},
      tasks: {},
      contextualQuestions: [],
      globalInformation: '',
      selectedModel: 'gpt-3.5-turbo-16k',
      chatApi: 'StartState',
      id: 'test-app-id',
      apps: {},
      isLoading: false,
      error: null,
      ...overrides,
    },
    auth: {} as MockSlice<RootState['auth']> as RootState['auth'],
    user: {} as MockSlice<RootState['user']> as RootState['user'],
    organization: {} as MockSlice<RootState['organization']> as RootState['organization'],
    settings: {} as MockSlice<RootState['settings']> as RootState['settings'],
    subscription: {} as MockSlice<RootState['subscription']> as RootState['subscription'],
    demo: {} as MockSlice<RootState['demo']> as RootState['demo'],
  };
}

// Helper to create mock data
function createMockEpic(overrides: Partial<EpicType> = {}): EpicType {
  return {
    id: 'epic-1',
    parentAppId: 'app-1',
    title: 'Test Epic',
    description: 'Epic description',
    goal: 'Epic goal',
    successCriteria: 'Success criteria',
    dependencies: '',
    timeline: '',
    resources: '',
    risksAndMitigation: [],
    featureIds: [],
    notes: '',
    ...overrides,
  };
}

function createMockFeature(overrides: Partial<FeatureType> = {}): FeatureType {
  return {
    id: 'feature-1',
    title: 'Test Feature',
    description: 'Feature description',
    details: '',
    acceptanceCriteria: [{ text: 'AC1' }],
    parentEpicId: 'epic-1',
    userStoryIds: [],
    notes: '',
    priority: 'High',
    effort: 'M',
    ...overrides,
  };
}

function createMockUserStory(overrides: Partial<UserStoryType> = {}): UserStoryType {
  return {
    id: 'story-1',
    title: 'Test Story',
    role: 'user',
    action: 'do something',
    goal: 'achieve goal',
    points: '5',
    acceptanceCriteria: [{ text: 'Story AC' }],
    notes: '',
    parentFeatureId: 'feature-1',
    taskIds: [],
    developmentOrder: 1,
    ...overrides,
  };
}

function createMockTask(overrides: Partial<TaskType> = {}): TaskType {
  return {
    id: 'task-1',
    title: 'Test Task',
    details: 'Task details',
    priority: 1,
    notes: '',
    parentUserStoryId: 'story-1',
    dependentTaskIds: [],
    ...overrides,
  };
}

describe('Copilot Export', () => {
  describe('exportCopilotInstructions', () => {
    it('exports instructions with default options', () => {
      const state = createMockState({
        globalInformation: 'A project management app',
      });

      const result = exportCopilotInstructions(state);

      expect(result).toContain('# Spec Tree Project');
      expect(result).toContain('A project management app');
      expect(result).toContain('## Tech Stack');
      expect(result).toContain('## Coding Conventions');
    });

    it('exports instructions without optional sections', () => {
      const state = createMockState();
      const options: CopilotExportOptions = {
        includeTechStack: false,
        includeConventions: false,
        includePatterns: false,
        includeTestRequirements: false,
      };

      const result = exportCopilotInstructions(state, options);

      expect(result).not.toContain('## Tech Stack');
      expect(result).not.toContain('## Coding Conventions');
      expect(result).not.toContain('## Architecture Patterns');
      expect(result).not.toContain('## Testing Requirements');
    });

    it('uses app name when available', () => {
      const state = createMockState({
        apps: {
          'app-1': {
            id: 'app-1',
            name: 'Custom App Name',
            globalInformation: '',
            applicationInformation: '',
            createdAt: new Date().toISOString(),
          },
        },
      });

      const result = exportCopilotInstructions(state);

      expect(result).toContain('# Custom App Name');
    });
  });

  describe('exportTaskAsWRAP', () => {
    it('exports task as WRAP format', () => {
      const task = createMockTask();
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();

      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
        tasks: { 'task-1': task },
      });

      const result = exportTaskAsWRAP('task-1', state);

      expect(result).toContain('## What');
      expect(result).toContain('Task details');
      expect(result).toContain('## Requirements');
      expect(result).toContain('## Actual files');
      expect(result).toContain('## Patterns');
    });

    it('throws error for non-existent task', () => {
      const state = createMockState();

      expect(() => {
        exportTaskAsWRAP('non-existent', state);
      }).toThrow('Task with ID non-existent not found');
    });

    it('includes hierarchy context', () => {
      const task = createMockTask();
      const userStory = createMockUserStory();
      const feature = createMockFeature();
      const epic = createMockEpic();

      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
        tasks: { 'task-1': task },
      });

      const result = exportTaskAsWRAP('task-1', state);

      expect(result).toContain('**Epic:** Test Epic');
      expect(result).toContain('**Feature:** Test Feature');
    });
  });

  describe('exportUserStoryTasksAsWRAP', () => {
    it('exports all tasks for a user story', () => {
      const userStory = createMockUserStory();
      const task1 = createMockTask({ id: 'task-1', title: 'Task One' });
      const task2 = createMockTask({ id: 'task-2', title: 'Task Two' });

      const state = createMockState({
        userStories: { 'story-1': userStory },
        tasks: { 'task-1': task1, 'task-2': task2 },
      });

      const result = exportUserStoryTasksAsWRAP('story-1', state);

      expect(result).toContain('Task One');
      expect(result).toContain('Task Two');
      expect(result).toContain('# Issue 1');
      expect(result).toContain('# Issue 2');
    });

    it('throws error for user story without tasks', () => {
      const userStory = createMockUserStory();

      const state = createMockState({
        userStories: { 'story-1': userStory },
        tasks: {},
      });

      expect(() => {
        exportUserStoryTasksAsWRAP('story-1', state);
      }).toThrow('No tasks found for user story story-1');
    });
  });

  describe('exportFeatureTasksAsWRAP', () => {
    it('exports all tasks for a feature', () => {
      const feature = createMockFeature();
      const userStory = createMockUserStory();
      const task = createMockTask();

      const state = createMockState({
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
        tasks: { 'task-1': task },
      });

      const result = exportFeatureTasksAsWRAP('feature-1', state);

      expect(result).toContain('Test Task');
    });

    it('throws error for non-existent feature', () => {
      const state = createMockState();

      expect(() => {
        exportFeatureTasksAsWRAP('non-existent', state);
      }).toThrow('Feature with ID non-existent not found');
    });
  });

  describe('exportEpicTasksAsWRAP', () => {
    it('exports all tasks for an epic', () => {
      const epic = createMockEpic();
      const feature = createMockFeature();
      const userStory = createMockUserStory();
      const task = createMockTask();

      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
        tasks: { 'task-1': task },
      });

      const result = exportEpicTasksAsWRAP('epic-1', state);

      expect(result).toContain('Test Task');
    });

    it('throws error for non-existent epic', () => {
      const state = createMockState();

      expect(() => {
        exportEpicTasksAsWRAP('non-existent', state);
      }).toThrow('Epic with ID non-existent not found');
    });
  });

  describe('copyCopilotToClipboard', () => {
    const originalClipboard = navigator.clipboard;

    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    it('copies content to clipboard successfully', async () => {
      const result = await copyCopilotToClipboard('test content');

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test content');
    });

    it('returns false when clipboard fails', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
        new Error('Clipboard error')
      );

      const result = await copyCopilotToClipboard('test');

      expect(result).toBe(false);
    });
  });

  describe('getWRAPStatistics', () => {
    it('returns correct counts for empty state', () => {
      const state = createMockState();

      const stats = getWRAPStatistics(state);

      expect(stats.totalTasks).toBe(0);
      expect(stats.tasksWithStories).toBe(0);
      expect(stats.tasksWithFeatures).toBe(0);
      expect(stats.tasksWithEpics).toBe(0);
    });

    it('returns correct counts with full hierarchy', () => {
      const epic = createMockEpic();
      const feature = createMockFeature();
      const userStory = createMockUserStory();
      const task = createMockTask();

      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
        tasks: { 'task-1': task },
      });

      const stats = getWRAPStatistics(state);

      expect(stats.totalTasks).toBe(1);
      expect(stats.tasksWithStories).toBe(1);
      expect(stats.tasksWithFeatures).toBe(1);
      expect(stats.tasksWithEpics).toBe(1);
    });

    it('counts tasks without full hierarchy correctly', () => {
      const task = createMockTask({ parentUserStoryId: 'non-existent' });

      const state = createMockState({
        tasks: { 'task-1': task },
      });

      const stats = getWRAPStatistics(state);

      expect(stats.totalTasks).toBe(1);
      expect(stats.tasksWithStories).toBe(0);
    });
  });
});
