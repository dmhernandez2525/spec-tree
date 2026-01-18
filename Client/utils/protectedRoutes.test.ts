import { describe, it, expect } from 'vitest';
import protectedRoutes from './protectedRoutes';

describe('protectedRoutes', () => {
  it('exports an array', () => {
    expect(Array.isArray(protectedRoutes)).toBe(true);
  });

  it('is initially empty', () => {
    expect(protectedRoutes).toHaveLength(0);
  });

  it('exports as default', () => {
    expect(protectedRoutes).toBeDefined();
  });
});
