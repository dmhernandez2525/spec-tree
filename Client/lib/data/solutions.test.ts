import { describe, it, expect } from 'vitest';
import { industries, roles } from './solutions';

describe('solutions data', () => {
  describe('industries', () => {
    it('exports industries array', () => {
      expect(Array.isArray(industries)).toBe(true);
      expect(industries.length).toBeGreaterThan(0);
    });

    it('each industry has required properties', () => {
      industries.forEach((industry) => {
        expect(industry.slug).toBeDefined();
        expect(typeof industry.slug).toBe('string');
        expect(industry.title).toBeDefined();
        expect(typeof industry.title).toBe('string');
        expect(industry.description).toBeDefined();
        expect(typeof industry.description).toBe('string');
        expect(industry.features).toBeDefined();
        expect(Array.isArray(industry.features)).toBe(true);
        expect(industry.benefits).toBeDefined();
        expect(Array.isArray(industry.benefits)).toBe(true);
      });
    });

    it('each industry has features with required properties', () => {
      industries.forEach((industry) => {
        industry.features.forEach((feature) => {
          expect(feature.title).toBeDefined();
          expect(feature.description).toBeDefined();
        });
      });
    });

    it('includes enterprise industry', () => {
      const enterprise = industries.find((i) => i.slug === 'enterprise');
      expect(enterprise).toBeDefined();
      expect(enterprise?.title).toContain('Enterprise');
    });

    it('all industries have unique slugs', () => {
      const slugs = industries.map((i) => i.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('roles', () => {
    it('exports roles array', () => {
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBeGreaterThan(0);
    });

    it('each role has required properties', () => {
      roles.forEach((role) => {
        expect(role.slug).toBeDefined();
        expect(typeof role.slug).toBe('string');
        expect(role.title).toBeDefined();
        expect(typeof role.title).toBe('string');
        expect(role.description).toBeDefined();
        expect(typeof role.description).toBe('string');
        expect(role.features).toBeDefined();
        expect(Array.isArray(role.features)).toBe(true);
        expect(role.benefits).toBeDefined();
        expect(Array.isArray(role.benefits)).toBe(true);
      });
    });

    it('all roles have unique slugs', () => {
      const slugs = roles.map((r) => r.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });
});
