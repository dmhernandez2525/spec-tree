export type UserRole = 'admin' | 'editor' | 'viewer';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
}

let userCounter = 0;

function nextId(): string {
  userCounter += 1;
  return `test-user-${userCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create a test user with sensible defaults. Pass an overrides object
 * to customise any field.
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = nextId();
  const index = userCounter;

  return {
    id,
    email: `testuser${index}@example.com`,
    name: `Test User ${index}`,
    role: 'editor',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=TU${index}`,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Convenience wrapper that creates a user with the admin role. */
export function createAdminUser(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({ role: 'admin', ...overrides });
}

/** Convenience wrapper that creates a user with the viewer role. */
export function createViewerUser(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({ role: 'viewer', ...overrides });
}

/** Reset the internal counter (useful between test files). */
export function resetUserCounter(): void {
  userCounter = 0;
}
