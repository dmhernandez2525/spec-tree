/**
 * Tests for StrapiService
 */

import { describe, it, expect } from 'vitest';
import { strapiService } from './strapi-service';

describe('StrapiService', () => {
  describe('service exports', () => {
    it('exports strapiService instance', () => {
      expect(strapiService).toBeDefined();
    });

    it('has fetchApps method', () => {
      expect(typeof strapiService.fetchApps).toBe('function');
    });

    it('has fetchAppById method', () => {
      expect(typeof strapiService.fetchAppById).toBe('function');
    });

    it('has createApp method', () => {
      expect(typeof strapiService.createApp).toBe('function');
    });

    it('has fetchEpics method', () => {
      expect(typeof strapiService.fetchEpics).toBe('function');
    });

    it('has createEpic method', () => {
      expect(typeof strapiService.createEpic).toBe('function');
    });

    it('has updateEpic method', () => {
      expect(typeof strapiService.updateEpic).toBe('function');
    });

    it('has deleteEpic method', () => {
      expect(typeof strapiService.deleteEpic).toBe('function');
    });

    it('has fetchFeatures method', () => {
      expect(typeof strapiService.fetchFeatures).toBe('function');
    });

    it('has createFeature method', () => {
      expect(typeof strapiService.createFeature).toBe('function');
    });

    it('has updateFeature method', () => {
      expect(typeof strapiService.updateFeature).toBe('function');
    });

    it('has deleteFeature method', () => {
      expect(typeof strapiService.deleteFeature).toBe('function');
    });

    it('has fetchUserStories method', () => {
      expect(typeof strapiService.fetchUserStories).toBe('function');
    });

    it('has createUserStory method', () => {
      expect(typeof strapiService.createUserStory).toBe('function');
    });

    it('has updateUserStory method', () => {
      expect(typeof strapiService.updateUserStory).toBe('function');
    });

    it('has deleteUserStory method', () => {
      expect(typeof strapiService.deleteUserStory).toBe('function');
    });

    it('has fetchTasks method', () => {
      expect(typeof strapiService.fetchTasks).toBe('function');
    });

    it('has createTask method', () => {
      expect(typeof strapiService.createTask).toBe('function');
    });

    it('has updateTask method', () => {
      expect(typeof strapiService.updateTask).toBe('function');
    });

    it('has deleteTask method', () => {
      expect(typeof strapiService.deleteTask).toBe('function');
    });

    it('has fetchAllAppData method', () => {
      expect(typeof strapiService.fetchAllAppData).toBe('function');
    });

    it('has updateEpicPosition method', () => {
      expect(typeof strapiService.updateEpicPosition).toBe('function');
    });

    it('has updateFeaturePosition method', () => {
      expect(typeof strapiService.updateFeaturePosition).toBe('function');
    });

    it('has updateUserStoryPosition method', () => {
      expect(typeof strapiService.updateUserStoryPosition).toBe('function');
    });

    it('has updateTaskPosition method', () => {
      expect(typeof strapiService.updateTaskPosition).toBe('function');
    });
  });
});
