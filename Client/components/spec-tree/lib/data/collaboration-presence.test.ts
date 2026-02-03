import { describe, it, expect } from 'vitest';
import {
  mockPresenceUsers,
  mockActivitySeed,
} from './collaboration-presence';

describe('collaboration-presence data', () => {
  it('provides mock presence users', () => {
    expect(mockPresenceUsers.length).toBeGreaterThan(0);
    expect(mockPresenceUsers[0]).toHaveProperty('id');
    expect(mockPresenceUsers[0]).toHaveProperty('name');
  });

  it('provides mock activity seed data', () => {
    expect(mockActivitySeed.length).toBeGreaterThan(0);
    expect(mockActivitySeed[0]).toHaveProperty('action');
    expect(mockActivitySeed[0]).toHaveProperty('targetType');
  });
});
