import { describe, it, expect } from 'vitest';
import { stateOptions } from './stateOptions';

describe('stateOptions', () => {
  it('is an array', () => {
    expect(Array.isArray(stateOptions)).toBe(true);
  });

  it('contains all 50 US states', () => {
    const mainStates = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
      'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
      'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
      'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
    ];

    mainStates.forEach((state) => {
      expect(stateOptions).toContain(state);
    });
  });

  it('contains District of Columbia', () => {
    expect(stateOptions).toContain('District of Columbia');
  });

  it('contains US territories', () => {
    const territories = [
      'American Samoa',
      'Guam',
      'Northern Mariana Islands',
      'Puerto Rico',
      'Virgin Islands',
    ];

    territories.forEach((territory) => {
      expect(stateOptions).toContain(territory);
    });
  });

  it('has correct total count (50 states + DC + territories)', () => {
    // 50 states + DC + territories (American Samoa, Guam, Northern Mariana Islands, Puerto Rico, Virgin Islands)
    expect(stateOptions.length).toBe(56);
  });

  it('contains only strings', () => {
    stateOptions.forEach((option) => {
      expect(typeof option).toBe('string');
    });
  });

  it('has no empty strings', () => {
    stateOptions.forEach((option) => {
      expect(option.trim().length).toBeGreaterThan(0);
    });
  });

  it('has no duplicates', () => {
    const uniqueOptions = new Set(stateOptions);
    expect(uniqueOptions.size).toBe(stateOptions.length);
  });

  it('is sorted alphabetically', () => {
    const sorted = [...stateOptions].sort();
    expect(stateOptions).toEqual(sorted);
  });
});
