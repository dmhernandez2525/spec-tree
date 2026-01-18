import { describe, it, expect } from 'vitest';
import {
  transformEpic,
  transformFeature,
  transformUserStory,
  transformTask,
  transformStrapiDataToSow,
} from './strapi-transformers';
import type {
  StrapiEpic,
  StrapiFeature,
  StrapiUserStory,
  StrapiTask,
  StrapiApp,
} from '@/types/strapi';

describe('strapi-transformers', () => {
  describe('transformEpic', () => {
    it('transforms a Strapi epic to EpicType', () => {
      const strapiEpic = {
        documentId: 'epic-123',
        title: 'Epic Title',
        description: 'Epic Description',
        goal: 'Epic Goal',
        successCriteria: 'Success Criteria',
        dependencies: 'Dependencies',
        timeline: '2 weeks',
        resources: 'Resources needed',
        risksAndMitigation: [
          {
            resolve: [{ text: 'Resolve Risk 1' }],
            own: [{ text: 'Own Risk 1' }],
            accept: [{ text: 'Accept Risk 1' }],
            mitigate: [{ text: 'Mitigate Risk 1' }],
          },
          {
            resolve: [{ text: 'Resolve Risk 2' }],
            own: [{ text: 'Own Risk 2' }],
            accept: [{ text: 'Accept Risk 2' }],
            mitigate: [{ text: 'Mitigate Risk 2' }],
          },
        ],
        notes: 'Some notes',
        features: [
          { documentId: 'feature-1' } as unknown as StrapiFeature,
          { documentId: 'feature-2' } as unknown as StrapiFeature,
        ],
        contextualQuestions: [
          { documentId: 'cq-1', question: 'Q1', answer: 'A1' },
        ],
      } as unknown as StrapiEpic;

      const result = transformEpic(strapiEpic);

      expect(result.id).toBe('epic-123');
      expect(result.documentId).toBe('epic-123');
      expect(result.title).toBe('Epic Title');
      expect(result.description).toBe('Epic Description');
      expect(result.goal).toBe('Epic Goal');
      expect(result.featureIds).toEqual(['feature-1', 'feature-2']);
      expect(result.contextualQuestions).toHaveLength(1);
    });

    it('handles missing optional fields', () => {
      const strapiEpic: StrapiEpic = {
        documentId: 'epic-123',
      } as StrapiEpic;

      const result = transformEpic(strapiEpic);

      expect(result.id).toBe('epic-123');
      expect(result.title).toBe('');
      expect(result.description).toBe('');
      expect(result.featureIds).toEqual([]);
      expect(result.contextualQuestions).toEqual([]);
    });
  });

  describe('transformFeature', () => {
    it('transforms a Strapi feature to FeatureType', () => {
      const strapiFeature = {
        documentId: 'feature-123',
        title: 'Feature Title',
        description: 'Feature Description',
        details: 'Feature Details',
        dependencies: 'Dependencies',
        acceptanceCriteria: [{ text: 'AC 1' }],
        notes: 'Notes',
        priority: 'High',
        effort: 'Medium',
        userStories: [
          { documentId: 'story-1' } as unknown as StrapiUserStory,
        ],
        contextualQuestions: [],
      } as unknown as StrapiFeature;

      const result = transformFeature(strapiFeature, 'parent-epic-id');

      expect(result.id).toBe('feature-123');
      expect(result.documentId).toBe('feature-123');
      expect(result.title).toBe('Feature Title');
      expect(result.parentEpicId).toBe('parent-epic-id');
      expect(result.userStoryIds).toEqual(['story-1']);
    });

    it('handles missing optional fields', () => {
      const strapiFeature: StrapiFeature = {
        documentId: 'feature-123',
      } as StrapiFeature;

      const result = transformFeature(strapiFeature, 'parent-epic-id');

      expect(result.title).toBe('');
      expect(result.description).toBe('');
      expect(result.userStoryIds).toEqual([]);
      expect(result.acceptanceCriteria).toEqual([{ text: '' }]);
    });
  });

  describe('transformUserStory', () => {
    it('transforms a Strapi user story to UserStoryType', () => {
      const strapiStory = {
        documentId: 'story-123',
        title: 'Story Title',
        role: 'User',
        action: 'do something',
        goal: 'achieve a goal',
        points: '5',
        acceptanceCriteria: [{ text: 'AC 1' }],
        notes: 'Notes',
        developmentOrder: 1,
        tasks: [
          { documentId: 'task-1' } as unknown as StrapiTask,
        ],
        contextualQuestions: [],
      } as unknown as StrapiUserStory;

      const result = transformUserStory(strapiStory, 'parent-feature-id');

      expect(result.id).toBe('story-123');
      expect(result.title).toBe('Story Title');
      expect(result.role).toBe('User');
      expect(result.points).toBe('5');
      expect(result.parentFeatureId).toBe('parent-feature-id');
      expect(result.taskIds).toEqual(['task-1']);
    });

    it('handles missing optional fields', () => {
      const strapiStory: StrapiUserStory = {
        documentId: 'story-123',
      } as StrapiUserStory;

      const result = transformUserStory(strapiStory, 'parent-feature-id');

      expect(result.title).toBe('');
      expect(result.role).toBe('');
      expect(result.points).toBe('');
      expect(result.taskIds).toEqual([]);
      expect(result.developmentOrder).toBe(0);
    });
  });

  describe('transformTask', () => {
    it('transforms a Strapi task to TaskType', () => {
      const strapiTask = {
        documentId: 'task-123',
        title: 'Task Title',
        details: 'Task Details',
        priority: 1,
        notes: 'Notes',
        contextualQuestions: [],
      } as unknown as StrapiTask;

      const result = transformTask(strapiTask, 'parent-story-id');

      expect(result.id).toBe('task-123');
      expect(result.title).toBe('Task Title');
      expect(result.details).toBe('Task Details');
      expect(result.priority).toBe(1);
      expect(result.parentUserStoryId).toBe('parent-story-id');
      expect(result.dependentTaskIds).toEqual([]);
    });

    it('handles missing optional fields', () => {
      const strapiTask: StrapiTask = {
        documentId: 'task-123',
      } as StrapiTask;

      const result = transformTask(strapiTask, 'parent-story-id');

      expect(result.title).toBe('');
      expect(result.details).toBe('');
      expect(result.priority).toBe(0);
    });
  });

  describe('transformStrapiDataToSow', () => {
    it('transforms complete Strapi app data to SOW state', () => {
      const strapiApp: StrapiApp = {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic 1',
            features: [
              {
                documentId: 'feature-1',
                title: 'Feature 1',
                userStories: [
                  {
                    documentId: 'story-1',
                    title: 'Story 1',
                    tasks: [
                      {
                        documentId: 'task-1',
                        title: 'Task 1',
                      } as StrapiTask,
                    ],
                  } as StrapiUserStory,
                ],
              } as StrapiFeature,
            ],
          } as StrapiEpic,
        ],
        contextualQuestions: [
          { documentId: 'cq-1', question: 'Q1', answer: 'A1' },
        ],
        globalInformation: 'Global info',
      } as StrapiApp;

      const result = transformStrapiDataToSow('app-123', strapiApp);

      expect(result.id).toBe('app-123');
      expect(Object.keys(result.epics)).toHaveLength(1);
      expect(Object.keys(result.features)).toHaveLength(1);
      expect(Object.keys(result.userStories)).toHaveLength(1);
      expect(Object.keys(result.tasks)).toHaveLength(1);
      expect(result.globalInformation).toBe('Global info');
      expect(result.contextualQuestions).toHaveLength(1);
    });

    it('handles empty app data', () => {
      const strapiApp: StrapiApp = {} as StrapiApp;

      const result = transformStrapiDataToSow('app-123', strapiApp);

      expect(result.id).toBe('app-123');
      expect(Object.keys(result.epics)).toHaveLength(0);
      expect(Object.keys(result.features)).toHaveLength(0);
      expect(Object.keys(result.userStories)).toHaveLength(0);
      expect(Object.keys(result.tasks)).toHaveLength(0);
      expect(result.globalInformation).toBe('');
    });

    it('handles multiple epics with nested data', () => {
      const strapiApp: StrapiApp = {
        epics: [
          {
            documentId: 'epic-1',
            title: 'Epic 1',
            features: [
              {
                documentId: 'feature-1',
                title: 'Feature 1',
                userStories: [],
              } as StrapiFeature,
            ],
          } as StrapiEpic,
          {
            documentId: 'epic-2',
            title: 'Epic 2',
            features: [
              {
                documentId: 'feature-2',
                title: 'Feature 2',
                userStories: [],
              } as StrapiFeature,
            ],
          } as StrapiEpic,
        ],
      } as StrapiApp;

      const result = transformStrapiDataToSow('app-123', strapiApp);

      expect(Object.keys(result.epics)).toHaveLength(2);
      expect(Object.keys(result.features)).toHaveLength(2);
      expect(result.features['feature-1'].parentEpicId).toBe('epic-1');
      expect(result.features['feature-2'].parentEpicId).toBe('epic-2');
    });
  });
});
