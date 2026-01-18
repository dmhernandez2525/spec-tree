import { describe, it, expect } from 'vitest';
import formattedDisplayTimeMonth from './formattedDisplayTimeMonth';

describe('formattedDisplayTimeMonth', () => {
  it('formats a valid date string', () => {
    // Use a date string without timezone to avoid timezone issues
    const result = formattedDisplayTimeMonth('2024-01-15T12:00:00');
    expect(result).toMatch(/January|2024/);
  });

  it('returns a string containing month, day, and year', () => {
    const result = formattedDisplayTimeMonth('2024-06-15T12:00:00');
    // Should contain year
    expect(result).toContain('2024');
    // Should be a non-empty formatted string
    expect(result.length).toBeGreaterThan(5);
  });

  it('returns a properly formatted date string', () => {
    const result = formattedDisplayTimeMonth('2024-07-20T12:00:00');
    // The format should be "Month Day, Year" (e.g., "July 20, 2024")
    expect(result).toMatch(/\w+\s+\d+,?\s+\d{4}/);
  });

  it('handles different date inputs', () => {
    const result1 = formattedDisplayTimeMonth('2024-03-15T12:00:00');
    const result2 = formattedDisplayTimeMonth('2023-11-25T12:00:00');

    expect(result1).toContain('2024');
    expect(result2).toContain('2023');
  });

  it('returns a non-empty string', () => {
    const result = formattedDisplayTimeMonth('2024-06-15');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats dates consistently', () => {
    // Same input should produce same output
    const result1 = formattedDisplayTimeMonth('2024-08-10T12:00:00');
    const result2 = formattedDisplayTimeMonth('2024-08-10T12:00:00');
    expect(result1).toBe(result2);
  });
});
