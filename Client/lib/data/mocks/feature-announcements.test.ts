import { describe, it, expect } from 'vitest';
import { FEATURE_ANNOUNCEMENTS } from './feature-announcements';

describe('feature-announcements mocks', () => {
  it('exports FEATURE_ANNOUNCEMENTS array', () => {
    expect(Array.isArray(FEATURE_ANNOUNCEMENTS)).toBe(true);
    expect(FEATURE_ANNOUNCEMENTS.length).toBeGreaterThan(0);
  });

  it('each announcement has required properties', () => {
    FEATURE_ANNOUNCEMENTS.forEach((announcement) => {
      expect(announcement.id).toBeDefined();
      expect(typeof announcement.id).toBe('string');
      expect(announcement.version).toBeDefined();
      expect(typeof announcement.version).toBe('string');
      expect(announcement.releaseDate).toBeDefined();
      expect(announcement.releaseDate).toBeInstanceOf(Date);
      expect(announcement.priority).toBeDefined();
      expect(typeof announcement.priority).toBe('number');
      expect(announcement.slides).toBeDefined();
      expect(Array.isArray(announcement.slides)).toBe(true);
      expect(announcement.routes).toBeDefined();
      expect(Array.isArray(announcement.routes)).toBe(true);
    });
  });

  it('each slide has required properties', () => {
    FEATURE_ANNOUNCEMENTS.forEach((announcement) => {
      announcement.slides.forEach((slide) => {
        expect(slide.id).toBeDefined();
        expect(slide.title).toBeDefined();
        expect(slide.description).toBeDefined();
        expect(slide.releaseDate).toBeDefined();
      });
    });
  });

  it('all announcements have unique ids', () => {
    const ids = FEATURE_ANNOUNCEMENTS.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('includes new dashboard announcement', () => {
    const dashboardAnnouncement = FEATURE_ANNOUNCEMENTS.find(
      (a) => a.id === 'new-dashboard-2024'
    );
    expect(dashboardAnnouncement).toBeDefined();
    expect(dashboardAnnouncement?.version).toBe('2.0.0');
  });

  it('announcements are sorted by priority descending', () => {
    for (let i = 0; i < FEATURE_ANNOUNCEMENTS.length - 1; i++) {
      expect(FEATURE_ANNOUNCEMENTS[i].priority).toBeGreaterThanOrEqual(
        FEATURE_ANNOUNCEMENTS[i + 1].priority
      );
    }
  });
});
