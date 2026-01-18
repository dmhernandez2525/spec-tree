import { describe, it, expect, vi } from 'vitest';
import generateId from './generate-id';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-1234'),
}));

describe('generateId', () => {
  it('generates a unique id using uuid v4', () => {
    const id = generateId();
    expect(id).toBe('mock-uuid-1234');
  });

  it('returns a string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('can be called multiple times', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
  });
});
