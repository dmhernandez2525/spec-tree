/**
 * Example Test - Verifies testing infrastructure is working
 *
 * This file can be deleted after initial setup verification.
 */

import { describe, it, expect, vi } from 'vitest';
import { createMockEpic, createMockFeature, createMockHierarchy } from './fixtures/work-items';

describe('Testing Infrastructure', () => {
  describe('Vitest Setup', () => {
    it('runs basic tests', () => {
      expect(true).toBe(true);
    });

    it('supports async tests', async () => {
      const result = await Promise.resolve('test');
      expect(result).toBe('test');
    });

    it('supports mocking', () => {
      const mockFn = vi.fn().mockReturnValue('mocked');
      expect(mockFn()).toBe('mocked');
      expect(mockFn).toHaveBeenCalledOnce();
    });
  });

  describe('Test Fixtures', () => {
    it('creates mock epics with default values', () => {
      const epic = createMockEpic();

      expect(epic).toHaveProperty('id');
      expect(epic).toHaveProperty('documentId');
      expect(epic).toHaveProperty('title');
      expect(epic).toHaveProperty('description');
      expect(epic.featureIds).toEqual([]);
    });

    it('creates mock epics with overrides', () => {
      const epic = createMockEpic({
        title: 'Custom Title',
        parentAppId: 'custom-app-id',
      });

      expect(epic.title).toBe('Custom Title');
      expect(epic.parentAppId).toBe('custom-app-id');
    });

    it('creates mock features', () => {
      const feature = createMockFeature();

      expect(feature).toHaveProperty('id');
      expect(feature).toHaveProperty('title');
      expect(feature.acceptanceCriteria).toBeInstanceOf(Array);
      expect(feature.userStoryIds).toEqual([]);
    });

    it('creates complete mock hierarchy', () => {
      const { app, epic, feature, userStory, task } = createMockHierarchy();

      // Verify hierarchy relationships
      expect(epic.parentAppId).toBe(app.documentId);
      expect(feature.parentEpicId).toBe(epic.documentId);
      expect(userStory.parentFeatureId).toBe(feature.documentId);
      expect(task.parentUserStoryId).toBe(userStory.documentId);

      // Verify child IDs are linked
      expect(epic.featureIds).toContain(feature.documentId);
      expect(feature.userStoryIds).toContain(userStory.documentId);
      expect(userStory.taskIds).toContain(task.documentId);
    });
  });

  describe('Global Mocks', () => {
    it('has URL.createObjectURL mocked', () => {
      const url = URL.createObjectURL(new Blob(['test']));
      expect(url).toBe('mocked-url');
    });

    it('has localStorage mocked', () => {
      window.localStorage.setItem('test', 'value');
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it('has sessionStorage mocked', () => {
      window.sessionStorage.setItem('test', 'value');
      expect(window.sessionStorage.setItem).toHaveBeenCalled();
    });
  });
});
