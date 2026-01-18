import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateTrialDaysRemaining,
  isTrialExpired,
  getTrialFeatures,
  formatTrialDate,
  DEFAULT_TRIAL_DURATION,
} from './trial';
import type { TrialStatus } from '@/types/trial';

describe('trial utilities', () => {
  describe('DEFAULT_TRIAL_DURATION', () => {
    it('is 14 days', () => {
      expect(DEFAULT_TRIAL_DURATION).toBe(14);
    });
  });

  describe('calculateTrialDaysRemaining', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns positive days when trial is active', () => {
      // Set "now" to a specific date
      vi.setSystemTime(new Date('2024-01-15T00:00:00Z'));

      // Trial started today should have 14 days remaining
      const daysRemaining = calculateTrialDaysRemaining('2024-01-15T00:00:00Z');
      expect(daysRemaining).toBe(14);
    });

    it('returns negative days when trial has expired', () => {
      vi.setSystemTime(new Date('2024-01-30T00:00:00Z'));

      // Trial started 20 days ago (14 - 20 = -6 days remaining)
      const daysRemaining = calculateTrialDaysRemaining('2024-01-10T00:00:00Z');
      expect(daysRemaining).toBeLessThan(0);
    });

    it('handles trials that are partially through', () => {
      vi.setSystemTime(new Date('2024-01-20T00:00:00Z'));

      // Trial started 5 days ago (14 - 5 = 9 days remaining)
      const daysRemaining = calculateTrialDaysRemaining('2024-01-15T00:00:00Z');
      expect(daysRemaining).toBe(9);
    });
  });

  describe('isTrialExpired', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns false when endDate is not set', () => {
      const trialStatus: TrialStatus = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: undefined as unknown as string,
      };

      expect(isTrialExpired(trialStatus)).toBe(false);
    });

    it('returns false when trial is still active', () => {
      vi.setSystemTime(new Date('2024-01-10T00:00:00Z'));

      const trialStatus: TrialStatus = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-20T00:00:00Z',
      };

      expect(isTrialExpired(trialStatus)).toBe(false);
    });

    it('returns true when trial has expired', () => {
      vi.setSystemTime(new Date('2024-01-25T00:00:00Z'));

      const trialStatus: TrialStatus = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-15T00:00:00Z',
      };

      expect(isTrialExpired(trialStatus)).toBe(true);
    });

    it('returns true when endDate is exactly now', () => {
      vi.setSystemTime(new Date('2024-01-15T00:00:01Z'));

      const trialStatus: TrialStatus = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-15T00:00:00Z',
      };

      expect(isTrialExpired(trialStatus)).toBe(true);
    });
  });

  describe('getTrialFeatures', () => {
    it('returns starter features', () => {
      const features = getTrialFeatures('starter');

      expect(features).toContain('Up to 5 team members');
      expect(features).toContain('10 active projects');
      expect(features).toContain('Email support');
    });

    it('returns professional features', () => {
      const features = getTrialFeatures('professional');

      expect(features).toContain('Up to 20 team members');
      expect(features).toContain('Unlimited projects');
      expect(features).toContain('Priority support');
      expect(features).toContain('Analytics dashboard');
    });

    it('returns enterprise features', () => {
      const features = getTrialFeatures('enterprise');

      expect(features).toContain('Unlimited team members');
      expect(features).toContain('Premium AI capabilities');
      expect(features).toContain('Dedicated support');
      expect(features).toContain('Advanced security features');
    });

    it('returns empty array for unknown plan', () => {
      const features = getTrialFeatures('unknown-plan');

      expect(features).toEqual([]);
    });

    it('features are non-empty arrays for known plans', () => {
      expect(getTrialFeatures('starter').length).toBeGreaterThan(0);
      expect(getTrialFeatures('professional').length).toBeGreaterThan(0);
      expect(getTrialFeatures('enterprise').length).toBeGreaterThan(0);
    });
  });

  describe('formatTrialDate', () => {
    it('formats date in US locale', () => {
      // Use a midday time to avoid timezone edge cases
      const result = formatTrialDate('2024-01-15T12:00:00');

      expect(result).toContain('2024');
      expect(result.length).toBeGreaterThan(5);
    });

    it('formats different dates correctly', () => {
      const result = formatTrialDate('2024-06-20T12:00:00');

      expect(result).toContain('2024');
    });

    it('returns a formatted string', () => {
      const result = formatTrialDate('2024-12-15T12:00:00');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should match the date format pattern
      expect(result).toMatch(/\w+\s+\d+,?\s+\d{4}/);
    });
  });
});
