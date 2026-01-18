import { describe, it, expect, vi } from 'vitest';
import {
  calculateTotalTasks,
  calculateTotalFeatures,
  calculateTotalUserStories,
} from './calculation-utils';
import type { RootState } from '../../../../lib/store';
import type { EpicType, FeatureType, UserStoryType } from '../types/work-items';

// Mock the selectors
vi.mock('../../../../lib/store/sow-slice', () => ({
  selectFeatureById: vi.fn((state: RootState, id: string) => {
    return state.sow.features[id];
  }),
  selectUserStoryById: vi.fn((state: RootState, id: string) => {
    return state.sow.userStories[id];
  }),
  selectTaskById: vi.fn((state: RootState, id: string) => {
    return state.sow.tasks[id];
  }),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
  },
}));

describe('calculation-utils', () => {
  const createMockState = (overrides = {}): RootState =>
    ({
      sow: {
        epics: {},
        features: {},
        userStories: {},
        tasks: {},
        contextualQuestions: [],
        globalInformation: '',
        selectedModel: 'gpt-4o',
        chatApi: 'StartState',
        id: '',
        apps: {},
        isLoading: false,
        error: null,
        ...overrides,
      },
    }) as RootState;

  describe('calculateTotalTasks', () => {
    it('calculates total tasks from epic', () => {
      const state = createMockState({
        features: {
          'feature-1': {
            id: 'feature-1',
            userStoryIds: ['story-1', 'story-2'],
          },
        },
        userStories: {
          'story-1': { id: 'story-1', taskIds: ['task-1', 'task-2'] },
          'story-2': { id: 'story-2', taskIds: ['task-3'] },
        },
        tasks: {
          'task-1': { id: 'task-1' },
          'task-2': { id: 'task-2' },
          'task-3': { id: 'task-3' },
        },
      });

      const epic: EpicType = {
        id: 'epic-1',
        title: 'Epic 1',
        featureIds: ['feature-1'],
      } as EpicType;

      const result = calculateTotalTasks(state, epic);
      expect(result).toBe(3);
    });

    it('calculates total tasks from array of epics', () => {
      const state = createMockState({
        features: {
          'feature-1': { id: 'feature-1', userStoryIds: ['story-1'] },
          'feature-2': { id: 'feature-2', userStoryIds: ['story-2'] },
        },
        userStories: {
          'story-1': { id: 'story-1', taskIds: ['task-1', 'task-2'] },
          'story-2': { id: 'story-2', taskIds: ['task-3'] },
        },
        tasks: {
          'task-1': { id: 'task-1' },
          'task-2': { id: 'task-2' },
          'task-3': { id: 'task-3' },
        },
      });

      const epics: EpicType[] = [
        { id: 'epic-1', title: 'Epic 1', featureIds: ['feature-1'] } as EpicType,
        { id: 'epic-2', title: 'Epic 2', featureIds: ['feature-2'] } as EpicType,
      ];

      const result = calculateTotalTasks(state, epics);
      expect(result).toBe(3);
    });

    it('calculates total tasks from feature', () => {
      const state = createMockState({
        userStories: {
          'story-1': { id: 'story-1', taskIds: ['task-1', 'task-2'] },
          'story-2': { id: 'story-2', taskIds: ['task-3', 'task-4'] },
        },
        tasks: {
          'task-1': { id: 'task-1' },
          'task-2': { id: 'task-2' },
          'task-3': { id: 'task-3' },
          'task-4': { id: 'task-4' },
        },
      });

      const feature: FeatureType = {
        id: 'feature-1',
        title: 'Feature 1',
        userStoryIds: ['story-1', 'story-2'],
      } as FeatureType;

      const result = calculateTotalTasks(state, feature);
      expect(result).toBe(4);
    });

    it('calculates total tasks from user story', () => {
      const state = createMockState();

      const userStory: UserStoryType = {
        id: 'story-1',
        title: 'Story 1',
        taskIds: ['task-1', 'task-2', 'task-3'],
      } as UserStoryType;

      const result = calculateTotalTasks(state, userStory);
      expect(result).toBe(3);
    });

    it('returns 0 for epic with no features', () => {
      const state = createMockState();

      const epic: EpicType = {
        id: 'epic-1',
        title: 'Epic 1',
        featureIds: [],
      } as EpicType;

      const result = calculateTotalTasks(state, epic);
      expect(result).toBe(0);
    });

    it('returns 0 for user story with no tasks', () => {
      const state = createMockState();

      const userStory: UserStoryType = {
        id: 'story-1',
        title: 'Story 1',
        taskIds: [],
      } as UserStoryType;

      const result = calculateTotalTasks(state, userStory);
      expect(result).toBe(0);
    });

    it('returns 0 for invalid input', () => {
      const state = createMockState();

      const result = calculateTotalTasks(state, {} as any);
      expect(result).toBe(0);
    });
  });

  describe('calculateTotalFeatures', () => {
    it('calculates total features from single epic', () => {
      const epic: EpicType = {
        id: 'epic-1',
        title: 'Epic 1',
        featureIds: ['feature-1', 'feature-2', 'feature-3'],
      } as EpicType;

      const result = calculateTotalFeatures(epic);
      expect(result).toBe(3);
    });

    it('calculates total features from array of epics', () => {
      const epics: EpicType[] = [
        { id: 'epic-1', title: 'Epic 1', featureIds: ['feature-1', 'feature-2'] } as EpicType,
        { id: 'epic-2', title: 'Epic 2', featureIds: ['feature-3'] } as EpicType,
        { id: 'epic-3', title: 'Epic 3', featureIds: ['feature-4', 'feature-5'] } as EpicType,
      ];

      const result = calculateTotalFeatures(epics);
      expect(result).toBe(5);
    });

    it('returns 0 for epic with no features', () => {
      const epic: EpicType = {
        id: 'epic-1',
        title: 'Epic 1',
        featureIds: [],
      } as EpicType;

      const result = calculateTotalFeatures(epic);
      expect(result).toBe(0);
    });

    it('returns 0 for empty array of epics', () => {
      const result = calculateTotalFeatures([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateTotalUserStories', () => {
    it('calculates total user stories from epic', () => {
      const state = createMockState({
        features: {
          'feature-1': { id: 'feature-1', userStoryIds: ['story-1', 'story-2'] },
          'feature-2': { id: 'feature-2', userStoryIds: ['story-3'] },
        },
      });

      const epic: EpicType = {
        id: 'epic-1',
        title: 'Epic 1',
        featureIds: ['feature-1', 'feature-2'],
      } as EpicType;

      const result = calculateTotalUserStories(state, epic);
      expect(result).toBe(3);
    });

    it('calculates total user stories from array of epics', () => {
      const state = createMockState({
        features: {
          'feature-1': { id: 'feature-1', userStoryIds: ['story-1'] },
          'feature-2': { id: 'feature-2', userStoryIds: ['story-2', 'story-3'] },
        },
      });

      const epics: EpicType[] = [
        { id: 'epic-1', title: 'Epic 1', featureIds: ['feature-1'] } as EpicType,
        { id: 'epic-2', title: 'Epic 2', featureIds: ['feature-2'] } as EpicType,
      ];

      const result = calculateTotalUserStories(state, epics);
      expect(result).toBe(3);
    });

    it('calculates total user stories from feature', () => {
      const state = createMockState();

      const feature: FeatureType = {
        id: 'feature-1',
        title: 'Feature 1',
        userStoryIds: ['story-1', 'story-2', 'story-3', 'story-4'],
      } as FeatureType;

      const result = calculateTotalUserStories(state, feature);
      expect(result).toBe(4);
    });

    it('returns 0 for epic with no features', () => {
      const state = createMockState();

      const epic: EpicType = {
        id: 'epic-1',
        title: 'Epic 1',
        featureIds: [],
      } as EpicType;

      const result = calculateTotalUserStories(state, epic);
      expect(result).toBe(0);
    });

    it('returns 0 for feature with no user stories', () => {
      const state = createMockState();

      const feature: FeatureType = {
        id: 'feature-1',
        title: 'Feature 1',
        userStoryIds: [],
      } as FeatureType;

      const result = calculateTotalUserStories(state, feature);
      expect(result).toBe(0);
    });
  });
});
