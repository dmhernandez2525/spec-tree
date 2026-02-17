import type { OrganizationSize, Industry } from '../../types/organization';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface TestOrganization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  memberCount: number;
  plan: 'free' | 'pro' | 'enterprise';
  size: OrganizationSize;
  industry: Industry;
  createdAt: string;
}

export interface TestWorkspace {
  id: string;
  name: string;
  organizationId: string;
  isDefault: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Counters
// ---------------------------------------------------------------------------

let orgCounter = 0;
let workspaceCounter = 0;

function nextOrgId(): string {
  orgCounter += 1;
  return `org-${orgCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextWorkspaceId(): string {
  workspaceCounter += 1;
  return `ws-${workspaceCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

/**
 * Create a test organization with sensible defaults. Pass an overrides
 * object to customise any field.
 */
export function createTestOrganization(
  overrides: Partial<TestOrganization> = {},
): TestOrganization {
  const id = nextOrgId();
  const index = orgCounter;

  return {
    id,
    name: `Test Organization ${index}`,
    slug: `test-org-${index}`,
    ownerId: `owner-${index}`,
    memberCount: 5,
    plan: 'pro',
    size: '11-50',
    industry: 'technology',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a test workspace with sensible defaults. Pass an overrides
 * object to customise any field.
 */
export function createTestWorkspace(
  overrides: Partial<TestWorkspace> = {},
): TestWorkspace {
  const id = nextWorkspaceId();
  const index = workspaceCounter;

  return {
    id,
    name: `Workspace ${index}`,
    organizationId: 'org-1',
    isDefault: index === 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Reset the internal counters (useful between test files). */
export function resetTeamCounters(): void {
  orgCounter = 0;
  workspaceCounter = 0;
}
