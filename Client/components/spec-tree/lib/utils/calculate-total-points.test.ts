import { describe, it, expect, vi } from 'vitest';
import calculateTotalPoints from './calculate-total-points';
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
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
  },
}));

describe('calculateTotalPoints', () => {
  const createMockState = (overrides = {}): RootState => ({
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
  } as RootState);

  describe('with array of user stories', () => {
    it('calculates total points from array of user stories', () => {
      const state = createMockState();
      const userStories: UserStoryType[] = [
        { id: 'story-1', points: '3' } as UserStoryType,
        { id: 'story-2', points: '5' } as UserStoryType,
        { id: 'story-3', points: '8' } as UserStoryType,
      ];

      const result = calculateTotalPoints(state, userStories);
      expect(result).toBe(16);
    });

    it('handles missing points in user stories', () => {
      const state = createMockState();
      const userStories: UserStoryType[] = [
        { id: 'story-1', points: '3' } as UserStoryType,
        { id: 'story-2' } as UserStoryType, // no points
        { id: 'story-3', points: '5' } as UserStoryType,
      ];

      const result = calculateTotalPoints(state, userStories);
      expect(result).toBe(8);
    });

    it('returns 0 for empty array', () => {
      const state = createMockState();
      const result = calculateTotalPoints(state, []);
      expect(result).toBe(0);
    });
  });

  describe('with epic', () => {
    it('calculates total points from epic features and user stories', () => {
      const state = createMockState({
        features: {
          'feature-1': {
            id: 'feature-1',
            userStoryIds: ['story-1', 'story-2'],
          },
          'feature-2': {
            id: 'feature-2',
            userStoryIds: ['story-3'],
          },
        },
        userStories: {
          'story-1': { id: 'story-1', points: '3' },
          'story-2': { id: 'story-2', points: '5' },
          'story-3': { id: 'story-3', points: '8' },
        },
      });

      const epic: EpicType = {
        id: 'epic-1',
        title: 'Epic 1',
        featureIds: ['feature-1', 'feature-2'],
      } as EpicType;

      const result = calculateTotalPoints(state, epic);
      expect(result).toBe(16);
    });

    it('returns 0 for epic with no features', () => {
      const state = createMockState();
      const epic: EpicType = {
        id: 'epic-1',
        title: 'Empty Epic',
        featureIds: [],
      } as EpicType;

      const result = calculateTotalPoints(state, epic);
      expect(result).toBe(0);
    });
  });

  describe('with feature', () => {
    it('calculates total points from feature user stories', () => {
      const state = createMockState({
        userStories: {
          'story-1': { id: 'story-1', points: '2' },
          'story-2': { id: 'story-2', points: '3' },
        },
      });

      const feature: FeatureType = {
        id: 'feature-1',
        title: 'Feature 1',
        userStoryIds: ['story-1', 'story-2'],
      } as FeatureType;

      const result = calculateTotalPoints(state, feature);
      expect(result).toBe(5);
    });

    it('returns 0 for feature with no user stories', () => {
      const state = createMockState();
      const feature: FeatureType = {
        id: 'feature-1',
        title: 'Empty Feature',
        userStoryIds: [],
      } as FeatureType;

      const result = calculateTotalPoints(state, feature);
      expect(result).toBe(0);
    });
  });

  describe('with single user story', () => {
    it('returns points from single user story', () => {
      const state = createMockState();
      const userStory: UserStoryType = {
        id: 'story-1',
        points: '13',
      } as UserStoryType;

      const result = calculateTotalPoints(state, userStory);
      expect(result).toBe(13);
    });

    it('returns 0 for user story with no points', () => {
      const state = createMockState();
      const userStory: UserStoryType = {
        id: 'story-1',
      } as UserStoryType;

      const result = calculateTotalPoints(state, userStory);
      expect(result).toBe(0);
    });
  });

  describe('with invalid input', () => {
    it('returns 0 for invalid input', () => {
      const state = createMockState();

      const result = calculateTotalPoints(state, {} as any);
      expect(result).toBe(0);
    });
  });
});
