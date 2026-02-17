/**
 * Tests for Context Propagation Utilities
 *
 * F1.1.2 - Full Context Propagation
 *
 * These tests verify that context is correctly propagated through the
 * work item hierarchy: Epic -> Feature -> User Story -> Task
 */

import { describe, it, expect } from 'vitest';
import {
  buildEpicContext,
  buildFeatureContext,
  buildUserStoryContext,
  buildTaskContext,
  getContextChain,
  buildContextSummary,
  getContextMetrics,
} from './context-propagation';
import { RootState } from '@/lib/store';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
  ContextualQuestion,
} from '../types/work-items';

// Partial type for mock slices that aren't being tested
type MockSlice<T> = Partial<T>;

// Helper to create a mock RootState with sow data
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
    // These slices are not used by context propagation, provide minimal mocks
    auth: {} as MockSlice<RootState['auth']> as RootState['auth'],
    user: {} as MockSlice<RootState['user']> as RootState['user'],
    organization: {} as MockSlice<RootState['organization']> as RootState['organization'],
    settings: {} as MockSlice<RootState['settings']> as RootState['settings'],
    subscription: {} as MockSlice<RootState['subscription']> as RootState['subscription'],
    demo: {} as MockSlice<RootState['demo']> as RootState['demo'],
    workspace: {} as MockSlice<RootState['workspace']> as RootState['workspace'],
    collaboration: {
      mode: 'edit' as const,
      isEnabled: true,
      activity: [],
    },
    comments: {
      commentsById: {},
      targetIndex: {},
      notifications: [],
    },
    restApi: {
      keys: [],
      usage: null,
      usageHistory: [],
      isLoading: false,
      error: null,
    },
  };
}

// Helper to create mock Epic
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

// Helper to create mock Feature
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

// Helper to create mock User Story
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

// Helper to create mock Task
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

// Helper to create contextual questions
function createContextualQuestions(count: number = 2): ContextualQuestion[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `q-${i + 1}`,
    question: `Question ${i + 1}?`,
    answer: `Answer ${i + 1}`,
  }));
}

describe('Context Propagation', () => {
  describe('buildEpicContext', () => {
    it('returns empty string when no global info or questions exist', () => {
      const epic = createMockEpic();
      const state = createMockState();

      const context = buildEpicContext(epic, state);

      expect(context).toBe('');
    });

    it('includes global information when present', () => {
      const epic = createMockEpic();
      const state = createMockState({
        globalInformation: 'This is a SaaS application for project management',
      });

      const context = buildEpicContext(epic, state);

      expect(context).toContain('=== Application Context ===');
      expect(context).toContain('SaaS application for project management');
    });

    it('includes epic contextual questions when present', () => {
      const epic = createMockEpic({
        contextualQuestions: createContextualQuestions(),
      });
      const state = createMockState();

      const context = buildEpicContext(epic, state);

      expect(context).toContain('=== Epic Contextual Information ===');
      expect(context).toContain('Q: Question 1?');
      expect(context).toContain('A: Answer 1');
      expect(context).toContain('Q: Question 2?');
      expect(context).toContain('A: Answer 2');
    });

    it('excludes questions without answers', () => {
      const epic = createMockEpic({
        contextualQuestions: [
          { id: 'q-1', question: 'Question 1?', answer: 'Answer 1' },
          { id: 'q-2', question: 'Question 2?', answer: '' }, // No answer
          { id: 'q-3', question: 'Question 3?', answer: undefined }, // No answer
        ],
      });
      const state = createMockState();

      const context = buildEpicContext(epic, state);

      expect(context).toContain('Q: Question 1?');
      expect(context).toContain('A: Answer 1');
      expect(context).not.toContain('Question 2?');
      expect(context).not.toContain('Question 3?');
    });

    it('combines global info and epic questions', () => {
      const epic = createMockEpic({
        contextualQuestions: createContextualQuestions(1),
      });
      const state = createMockState({
        globalInformation: 'Global app description',
      });

      const context = buildEpicContext(epic, state);

      expect(context).toContain('=== Application Context ===');
      expect(context).toContain('=== Epic Contextual Information ===');
      expect(context).toContain('Global app description');
      expect(context).toContain('Q: Question 1?');
    });
  });

  describe('buildFeatureContext', () => {
    it('includes global information', () => {
      const feature = createMockFeature();
      const state = createMockState({
        globalInformation: 'Global context info',
      });

      const context = buildFeatureContext(feature, state);

      expect(context).toContain('=== Application Context ===');
      expect(context).toContain('Global context info');
    });

    it('includes parent epic information when epic exists', () => {
      const epic = createMockEpic({
        id: 'epic-1',
        title: 'Parent Epic Title',
        description: 'Parent epic description',
        goal: 'Parent epic goal',
      });
      const feature = createMockFeature({ parentEpicId: 'epic-1' });
      const state = createMockState({
        epics: { 'epic-1': epic },
      });

      const context = buildFeatureContext(feature, state);

      expect(context).toContain('=== Parent Epic: Parent Epic Title ===');
      expect(context).toContain('Description: Parent epic description');
      expect(context).toContain('Goal: Parent epic goal');
    });

    it('includes parent epic contextual questions', () => {
      const epic = createMockEpic({
        id: 'epic-1',
        contextualQuestions: createContextualQuestions(1),
      });
      const feature = createMockFeature({ parentEpicId: 'epic-1' });
      const state = createMockState({
        epics: { 'epic-1': epic },
      });

      const context = buildFeatureContext(feature, state);

      expect(context).toContain('=== Epic Contextual Information ===');
      expect(context).toContain('Q: Question 1?');
    });

    it('includes feature contextual questions', () => {
      const feature = createMockFeature({
        contextualQuestions: createContextualQuestions(1),
      });
      const state = createMockState();

      const context = buildFeatureContext(feature, state);

      expect(context).toContain('=== Feature Contextual Information ===');
      expect(context).toContain('Q: Question 1?');
    });

    it('handles missing parent epic gracefully', () => {
      const feature = createMockFeature({ parentEpicId: 'non-existent' });
      const state = createMockState();

      const context = buildFeatureContext(feature, state);

      // Should not throw and should not include epic section
      expect(context).not.toContain('=== Parent Epic');
    });
  });

  describe('buildUserStoryContext', () => {
    it('includes full hierarchy: global -> epic -> feature', () => {
      const epic = createMockEpic({
        id: 'epic-1',
        title: 'Epic Title',
        description: 'Epic desc',
        goal: 'Epic goal',
      });
      const feature = createMockFeature({
        id: 'feature-1',
        parentEpicId: 'epic-1',
        title: 'Feature Title',
        description: 'Feature desc',
        details: 'Feature details',
      });
      const userStory = createMockUserStory({ parentFeatureId: 'feature-1' });
      const state = createMockState({
        globalInformation: 'App description',
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
      });

      const context = buildUserStoryContext(userStory, state);

      // Check global context
      expect(context).toContain('=== Application Context ===');
      expect(context).toContain('App description');

      // Check epic context
      expect(context).toContain('=== Epic: Epic Title ===');
      expect(context).toContain('Description: Epic desc');
      expect(context).toContain('Goal: Epic goal');

      // Check feature context
      expect(context).toContain('=== Feature: Feature Title ===');
      expect(context).toContain('Description: Feature desc');
      expect(context).toContain('Details: Feature details');
    });

    it('includes contextual questions from all levels', () => {
      const epic = createMockEpic({
        id: 'epic-1',
        contextualQuestions: [
          { id: 'eq1', question: 'Epic Q?', answer: 'Epic A' },
        ],
      });
      const feature = createMockFeature({
        id: 'feature-1',
        parentEpicId: 'epic-1',
        contextualQuestions: [
          { id: 'fq1', question: 'Feature Q?', answer: 'Feature A' },
        ],
      });
      const userStory = createMockUserStory({
        parentFeatureId: 'feature-1',
        contextualQuestions: [
          { id: 'sq1', question: 'Story Q?', answer: 'Story A' },
        ],
      });
      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
      });

      const context = buildUserStoryContext(userStory, state);

      expect(context).toContain('Epic Q?');
      expect(context).toContain('Epic A');
      expect(context).toContain('Feature Q?');
      expect(context).toContain('Feature A');
      expect(context).toContain('Story Q?');
      expect(context).toContain('Story A');
    });
  });

  describe('buildTaskContext', () => {
    it('includes full hierarchy: global -> epic -> feature -> user story', () => {
      const epic = createMockEpic({ id: 'epic-1', title: 'Epic' });
      const feature = createMockFeature({
        id: 'feature-1',
        parentEpicId: 'epic-1',
        title: 'Feature',
      });
      const userStory = createMockUserStory({
        id: 'story-1',
        parentFeatureId: 'feature-1',
        title: 'User Story',
        role: 'developer',
        action: 'write tests',
        goal: 'ensure quality',
      });
      const task = createMockTask({ parentUserStoryId: 'story-1' });
      const state = createMockState({
        globalInformation: 'Testing app',
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
      });

      const context = buildTaskContext(task, state);

      expect(context).toContain('=== Application Context ===');
      expect(context).toContain('=== Epic: Epic ===');
      expect(context).toContain('=== Feature: Feature ===');
      expect(context).toContain('=== User Story: User Story ===');
      expect(context).toContain('Role: developer');
      expect(context).toContain('Action: write tests');
      expect(context).toContain('Goal: ensure quality');
    });

    it('includes task contextual questions', () => {
      const userStory = createMockUserStory({ id: 'story-1' });
      const task = createMockTask({
        parentUserStoryId: 'story-1',
        contextualQuestions: [
          { id: 'tq1', question: 'Task Q?', answer: 'Task A' },
        ],
      });
      const state = createMockState({
        userStories: { 'story-1': userStory },
      });

      const context = buildTaskContext(task, state);

      expect(context).toContain('=== Task Contextual Information ===');
      expect(context).toContain('Task Q?');
      expect(context).toContain('Task A');
    });

    it('handles missing parent gracefully', () => {
      const task = createMockTask({ parentUserStoryId: 'non-existent' });
      const state = createMockState();

      const context = buildTaskContext(task, state);

      // When parent is missing, should return empty string or only global context
      // The function should not throw and should handle gracefully
      expect(typeof context).toBe('string');
      // Since no global info and no valid hierarchy, context should be empty
      expect(context).toBe('');
    });
  });

  describe('getContextChain', () => {
    it('delegates to correct builder for epic', () => {
      const epic = createMockEpic();
      const state = createMockState({
        globalInformation: 'Epic context test',
      });

      const context = getContextChain(epic, 'epic', state);

      expect(context).toContain('Epic context test');
    });

    it('delegates to correct builder for feature', () => {
      const feature = createMockFeature();
      const state = createMockState({
        globalInformation: 'Feature context test',
      });

      const context = getContextChain(feature, 'feature', state);

      expect(context).toContain('Feature context test');
    });

    it('delegates to correct builder for userStory', () => {
      const userStory = createMockUserStory();
      const state = createMockState({
        globalInformation: 'Story context test',
      });

      const context = getContextChain(userStory, 'userStory', state);

      expect(context).toContain('Story context test');
    });

    it('delegates to correct builder for task', () => {
      const task = createMockTask();
      const state = createMockState({
        globalInformation: 'Task context test',
      });

      const context = getContextChain(task, 'task', state);

      expect(context).toContain('Task context test');
    });

    it('returns empty string for unknown type', () => {
      const item = createMockEpic();
      const state = createMockState();

      // @ts-expect-error - Testing invalid type
      const context = getContextChain(item, 'unknown', state);

      expect(context).toBe('');
    });
  });

  describe('buildContextSummary', () => {
    it('reports global context availability', () => {
      const epic = createMockEpic();
      const stateWithGlobal = createMockState({
        globalInformation: 'Some info',
      });
      const stateWithoutGlobal = createMockState();

      const summaryWith = buildContextSummary(epic, 'epic', stateWithGlobal);
      const summaryWithout = buildContextSummary(epic, 'epic', stateWithoutGlobal);

      expect(summaryWith.globalContext).toBe(true);
      expect(summaryWithout.globalContext).toBe(false);
    });

    it('reports item questions availability', () => {
      const epicWithQ = createMockEpic({
        contextualQuestions: [{ id: 'q1', question: 'Q?', answer: 'A' }],
      });
      const epicWithoutQ = createMockEpic();
      const state = createMockState();

      const summaryWith = buildContextSummary(epicWithQ, 'epic', state);
      const summaryWithout = buildContextSummary(epicWithoutQ, 'epic', state);

      expect(summaryWith.itemQuestions).toBe(true);
      expect(summaryWithout.itemQuestions).toBe(false);
    });

    it('reports epic context for feature', () => {
      const epic = createMockEpic({
        id: 'epic-1',
        title: 'Test Epic',
        contextualQuestions: [{ id: 'q1', question: 'Q?', answer: 'A' }],
      });
      const feature = createMockFeature({ parentEpicId: 'epic-1' });
      const state = createMockState({
        epics: { 'epic-1': epic },
      });

      const summary = buildContextSummary(feature, 'feature', state);

      expect(summary.epicContext).toBeDefined();
      expect(summary.epicContext?.title).toBe('Test Epic');
      expect(summary.epicContext?.hasQuestions).toBe(true);
    });

    it('reports full hierarchy for task', () => {
      const epic = createMockEpic({ id: 'epic-1', title: 'Epic' });
      const feature = createMockFeature({
        id: 'feature-1',
        parentEpicId: 'epic-1',
        title: 'Feature',
      });
      const userStory = createMockUserStory({
        id: 'story-1',
        parentFeatureId: 'feature-1',
        title: 'Story',
      });
      const task = createMockTask({ parentUserStoryId: 'story-1' });
      const state = createMockState({
        epics: { 'epic-1': epic },
        features: { 'feature-1': feature },
        userStories: { 'story-1': userStory },
      });

      const summary = buildContextSummary(task, 'task', state);

      expect(summary.epicContext?.title).toBe('Epic');
      expect(summary.featureContext?.title).toBe('Feature');
      expect(summary.userStoryContext?.title).toBe('Story');
    });
  });

  describe('getContextMetrics', () => {
    it('returns correct metrics for empty context', () => {
      const metrics = getContextMetrics('');

      expect(metrics.length).toBe(0);
      expect(metrics.sections).toBe(0);
      expect(metrics.hasGlobalContext).toBe(false);
      expect(metrics.hasGlobalQuestions).toBe(false);
      expect(metrics.hasItemQuestions).toBe(false);
    });

    it('detects global application context', () => {
      const context = '=== Application Context ===\nSome app description';
      const metrics = getContextMetrics(context);

      expect(metrics.hasGlobalContext).toBe(true);
      expect(metrics.hasGlobalQuestions).toBe(false);
      expect(metrics.sections).toBe(1); // One section header has 2 === markers
    });

    it('detects global project questions', () => {
      const context =
        '=== Global Project Context ===\nQ: What is this?\nA: An app';
      const metrics = getContextMetrics(context);

      expect(metrics.hasGlobalContext).toBe(false);
      expect(metrics.hasGlobalQuestions).toBe(true);
    });

    it('detects item contextual questions', () => {
      const context =
        '=== Epic Contextual Information ===\nQ: Question?\nA: Answer';
      const metrics = getContextMetrics(context);

      expect(metrics.hasItemQuestions).toBe(true);
    });

    it('counts sections correctly', () => {
      const context = `=== Application Context ===
Some info

=== Global Project Context ===
Q: Q1?
A: A1

=== Epic: Test ===
Description: Test`;

      const metrics = getContextMetrics(context);

      // Each section header has 2 === markers, so 3 sections = 6 markers / 2 = 3
      expect(metrics.sections).toBe(3);
    });

    it('calculates length correctly', () => {
      const context = 'Test context string';
      const metrics = getContextMetrics(context);

      expect(metrics.length).toBe(19);
    });
  });

  describe('Global Q&A Propagation', () => {
    it('includes global contextual questions in epic context', () => {
      const epic = createMockEpic();
      const state = createMockState({
        globalInformation: 'App description',
        contextualQuestions: [
          { id: 'gq1', question: 'Global Q1?', answer: 'Global A1' },
          { id: 'gq2', question: 'Global Q2?', answer: 'Global A2' },
        ],
      });

      const context = buildEpicContext(epic, state);

      expect(context).toContain('=== Global Project Context ===');
      expect(context).toContain('Q: Global Q1?');
      expect(context).toContain('A: Global A1');
      expect(context).toContain('Q: Global Q2?');
      expect(context).toContain('A: Global A2');
    });

    it('includes global contextual questions in feature context', () => {
      const feature = createMockFeature();
      const state = createMockState({
        contextualQuestions: [
          { id: 'gq1', question: 'Global Feature Q?', answer: 'Global Feature A' },
        ],
      });

      const context = buildFeatureContext(feature, state);

      expect(context).toContain('=== Global Project Context ===');
      expect(context).toContain('Q: Global Feature Q?');
      expect(context).toContain('A: Global Feature A');
    });

    it('includes global contextual questions in user story context', () => {
      const userStory = createMockUserStory();
      const state = createMockState({
        contextualQuestions: [
          { id: 'gq1', question: 'Global Story Q?', answer: 'Global Story A' },
        ],
      });

      const context = buildUserStoryContext(userStory, state);

      expect(context).toContain('=== Global Project Context ===');
      expect(context).toContain('Q: Global Story Q?');
      expect(context).toContain('A: Global Story A');
    });

    it('includes global contextual questions in task context', () => {
      const userStory = createMockUserStory({ id: 'story-1' });
      const task = createMockTask({ parentUserStoryId: 'story-1' });
      const state = createMockState({
        userStories: { 'story-1': userStory },
        contextualQuestions: [
          { id: 'gq1', question: 'Global Task Q?', answer: 'Global Task A' },
        ],
      });

      const context = buildTaskContext(task, state);

      expect(context).toContain('=== Global Project Context ===');
      expect(context).toContain('Q: Global Task Q?');
      expect(context).toContain('A: Global Task A');
    });

    it('excludes global questions without answers', () => {
      const epic = createMockEpic();
      const state = createMockState({
        contextualQuestions: [
          { id: 'gq1', question: 'Answered Q?', answer: 'Has answer' },
          { id: 'gq2', question: 'Unanswered Q?', answer: '' },
          { id: 'gq3', question: 'Also unanswered?', answer: undefined },
        ],
      });

      const context = buildEpicContext(epic, state);

      expect(context).toContain('Q: Answered Q?');
      expect(context).toContain('A: Has answer');
      expect(context).not.toContain('Unanswered Q?');
      expect(context).not.toContain('Also unanswered?');
    });

    it('combines global and local contextual questions', () => {
      const epic = createMockEpic({
        contextualQuestions: [
          { id: 'eq1', question: 'Epic specific Q?', answer: 'Epic specific A' },
        ],
      });
      const state = createMockState({
        globalInformation: 'App info',
        contextualQuestions: [
          { id: 'gq1', question: 'Global Q?', answer: 'Global A' },
        ],
      });

      const context = buildEpicContext(epic, state);

      // Should have all three sections
      expect(context).toContain('=== Application Context ===');
      expect(context).toContain('=== Global Project Context ===');
      expect(context).toContain('=== Epic Contextual Information ===');
      // And both Q&A pairs
      expect(context).toContain('Q: Global Q?');
      expect(context).toContain('Q: Epic specific Q?');
    });
  });
});
