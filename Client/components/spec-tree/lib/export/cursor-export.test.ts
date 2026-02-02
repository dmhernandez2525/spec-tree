/**
 * Tests for Cursor Export
 *
 * F2.1.1 - Cursor Rules Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportProjectToCursorRules,
  exportFeatureToCursorRules,
  exportEpicToCursorRules,
  copyCursorRulesToClipboard,
  getExportStatistics,
  CursorExportOptions,
} from './cursor-export';
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

// Helper to create mock epic
function createMockEpic(overrides: Partial<EpicType> = {}): EpicType {
  return {
    id: 'epic-1',
    parentAppId: 'app-1',
    title: 'Test Epic',
    description: 'Epic description',
    goal: 'Epic goal',
    successCriteria: 'Success criteria',
    dependencies: 'No dependencies',
    timeline: '2 weeks',
    resources: 'Development team',
    risksAndMitigation: [],
    featureIds: [],
    notes: 'Epic notes',
    contextualQuestions: [],
    ...overrides,
  };
}

// Helper to create mock feature
function createMockFeature(overrides: Partial<FeatureType> = {}): FeatureType {
  return {
    id: 'feature-1',
    title: 'Test Feature',
    description: 'Feature description',
    details: 'Feature details',
    dependencies: 'None',
    acceptanceCriteria: [{ text: 'Criteria 1' }],
    priority: 'High',
    effort: 'M',
    parentEpicId: 'epic-1',
    userStoryIds: [],
    notes: 'Feature notes',
    contextualQuestions: [],
    ...overrides,
  };
}

// Helper to create mock user story
function createMockUserStory(overrides: Partial<UserStoryType> = {}): UserStoryType {
  return {
    id: 'story-1',
    title: 'Test User Story',
    role: 'user',
    action: 'perform action',
    goal: 'achieve goal',
    points: '5',
    acceptanceCriteria: [{ text: 'Criteria 1' }],
    notes: 'Story notes',
    parentFeatureId: 'feature-1',
    taskIds: [],
    developmentOrder: 1,
    dependentUserStoryIds: [],
    contextualQuestions: [],
    ...overrides,
  };
}

// Helper to create mock task
function createMockTask(overrides: Partial<TaskType> = {}): TaskType {
  return {
    id: 'task-1',
    title: 'Test Task',
    details: 'Task details',
    priority: 1,
    notes: 'Task notes',
    parentUserStoryId: 'story-1',
    dependentTaskIds: [],
    contextualQuestions: [],
    ...overrides,
  };
}

describe('Cursor Export', () => {
  describe('exportProjectToCursorRules', () => {
    it('exports project with default options', () => {
      const state = createMockState({
        globalInformation: 'A project management application',
      });

      const result = exportProjectToCursorRules(state);

      expect(result).toContain('---');
      expect(result).toContain('# Project:');
      expect(result).toContain('A project management application');
      expect(result).toContain('## Tech Stack');
      expect(result).toContain('## Code Style');
      expect(result).toContain('## Architecture');
    });

    it('exports project without optional sections', () => {
      const state = createMockState();
      const options: CursorExportOptions = {
        includeTechStack: false,
        includeCodeStyle: false,
        includeArchitecture: false,
      };

      const result = exportProjectToCursorRules(state, options);

      expect(result).toContain('# Project:');
      expect(result).not.toContain('## Tech Stack');
      expect(result).not.toContain('## Code Style');
      expect(result).not.toContain('## Architecture');
    });

    it('uses custom tech stack when provided', () => {
      const state = createMockState();
      const options: CursorExportOptions = {
        includeTechStack: true,
        includeCodeStyle: false,
        includeArchitecture: false,
        customTechStack: {
          framework: 'Vue.js 3',
          language: 'JavaScript',
        },
      };

      const result = exportProjectToCursorRules(state, options);

      expect(result).toContain('Vue.js 3');
      expect(result).toContain('JavaScript');
      expect(result).not.toContain('Next.js');
    });

    it('uses app name when available', () => {
      const state = createMockState({
        apps: {
          'app-1': {
            id: 'app-1',
            name: 'My Custom App',
            globalInformation: '',
            applicationInformation: '',
            createdAt: new Date().toISOString(),
          },
        },
      });

      const result = exportProjectToCursorRules(state);

      expect(result).toContain('# Project: My Custom App');
    });
  });

  describe('exportFeatureToCursorRules', () => {
    it('exports feature with full context', () => {
      const epic = createMockEpic();
      const feature = createMockFeature({ parentEpicId: 'epic-1' });
      const userStory = createMockUserStory({ parentFeatureId: 'feature-1' });
      const task = createMockTask({ parentUserStoryId: 'story-1' });

      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
        tasks: { 'task-1': task },
      });

      const result = exportFeatureToCursorRules('feature-1', state);

      expect(result).toContain('## Current Feature Context');
      expect(result).toContain('### Feature: Test Feature');
      expect(result).toContain('**Epic:** Test Epic');
      expect(result).toContain('### User Stories');
      expect(result).toContain('Test User Story');
      expect(result).toContain('### Tasks');
      expect(result).toContain('Test Task');
    });

    it('throws error for non-existent feature', () => {
      const state = createMockState();

      expect(() => {
        exportFeatureToCursorRules('non-existent', state);
      }).toThrow('Feature with ID non-existent not found');
    });

    it('handles feature without parent epic', () => {
      const feature = createMockFeature({ parentEpicId: 'non-existent' });

      const state = createMockState({
        features: { 'feature-1': feature },
      });

      const result = exportFeatureToCursorRules('feature-1', state);

      expect(result).toContain('### Feature: Test Feature');
      expect(result).not.toContain('**Epic:**');
    });
  });

  describe('exportEpicToCursorRules', () => {
    it('exports epic with all features', () => {
      const epic = createMockEpic();
      const feature = createMockFeature({ parentEpicId: 'epic-1' });

      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
      });

      const result = exportEpicToCursorRules('epic-1', state);

      expect(result).toContain('## Epic: Test Epic');
      expect(result).toContain('Epic description');
      expect(result).toContain('**Goal:** Epic goal');
    });

    it('throws error for non-existent epic', () => {
      const state = createMockState();

      expect(() => {
        exportEpicToCursorRules('non-existent', state);
      }).toThrow('Epic with ID non-existent not found');
    });
  });

  describe('copyCursorRulesToClipboard', () => {
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
      const content = '# Test Content';
      const result = await copyCursorRulesToClipboard(content);

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content);
    });

    it('returns false when clipboard fails', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
        new Error('Clipboard not available')
      );

      const result = await copyCursorRulesToClipboard('content');

      expect(result).toBe(false);
    });
  });

  describe('getExportStatistics', () => {
    it('returns correct counts for empty state', () => {
      const state = createMockState();

      const stats = getExportStatistics(state);

      expect(stats.totalEpics).toBe(0);
      expect(stats.totalFeatures).toBe(0);
      expect(stats.totalUserStories).toBe(0);
      expect(stats.totalTasks).toBe(0);
      expect(stats.totalAcceptanceCriteria).toBe(0);
    });

    it('returns correct counts with data', () => {
      const epic = createMockEpic();
      const feature = createMockFeature({
        acceptanceCriteria: [{ text: 'AC1' }, { text: 'AC2' }],
      });
      const userStory = createMockUserStory({
        acceptanceCriteria: [{ text: 'AC3' }],
      });
      const task = createMockTask();

      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
        tasks: { 'task-1': task },
      });

      const stats = getExportStatistics(state);

      expect(stats.totalEpics).toBe(1);
      expect(stats.totalFeatures).toBe(1);
      expect(stats.totalUserStories).toBe(1);
      expect(stats.totalTasks).toBe(1);
      expect(stats.totalAcceptanceCriteria).toBe(3); // 2 from feature + 1 from story
    });

    it('handles multiple items correctly', () => {
      const state = createMockState({
        epics: {
          'epic-1': createMockEpic({ id: 'epic-1' }),
          'epic-2': createMockEpic({ id: 'epic-2' }),
        },
        features: {
          'feature-1': createMockFeature({ id: 'feature-1' }),
          'feature-2': createMockFeature({ id: 'feature-2' }),
          'feature-3': createMockFeature({ id: 'feature-3' }),
        },
      });

      const stats = getExportStatistics(state);

      expect(stats.totalEpics).toBe(2);
      expect(stats.totalFeatures).toBe(3);
    });
  });
});
