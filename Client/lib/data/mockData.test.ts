import { describe, it, expect } from 'vitest';
import { epicMockNewData } from './mockData';

describe('mockData', () => {
  describe('epicMockNewData', () => {
    it('exports epicMockNewData array', () => {
      expect(Array.isArray(epicMockNewData)).toBe(true);
      expect(epicMockNewData.length).toBeGreaterThan(0);
    });

    it('each epic has required properties', () => {
      epicMockNewData.forEach((epic) => {
        expect(epic.appId).toBeDefined();
        expect(typeof epic.appId).toBe('string');
        expect(epic.id).toBeDefined();
        expect(typeof epic.id).toBe('string');
        expect(epic.title).toBeDefined();
        expect(typeof epic.title).toBe('string');
        expect(epic.description).toBeDefined();
        expect(typeof epic.description).toBe('string');
        expect(epic.goal).toBeDefined();
        expect(typeof epic.goal).toBe('string');
        expect(epic.successCriteria).toBeDefined();
        expect(epic.dependencies).toBeDefined();
        expect(epic.timeline).toBeDefined();
        expect(epic.resources).toBeDefined();
      });
    });

    it('all epics have unique ids', () => {
      const ids = epicMockNewData.map((epic) => epic.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all epics have the same appId', () => {
      const appIds = new Set(epicMockNewData.map((epic) => epic.appId));
      expect(appIds.size).toBe(1);
    });

    it('includes project management integration epic', () => {
      const integrationEpic = epicMockNewData.find((epic) =>
        epic.title.includes('Project Management')
      );
      expect(integrationEpic).toBeDefined();
    });

    it('includes AI assistance epic', () => {
      const aiEpic = epicMockNewData.find((epic) =>
        epic.title.includes('AI')
      );
      expect(aiEpic).toBeDefined();
    });
  });
});
