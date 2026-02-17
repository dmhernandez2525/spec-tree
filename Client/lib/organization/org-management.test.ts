import { describe, it, expect, beforeEach } from 'vitest';
import {
  PLAN_LIMITS,
  ROLE_HIERARCHY,
  generateSlug,
  createOrganization,
  canPerformAction,
  createInvitation,
  isInvitationValid,
  addMemberToOrg,
  removeMember,
  createTeam,
  getTeamMembers,
  getMemberRole,
  updateMemberRole,
  getOrgStats,
  type Organization,
  type OrgMember,
  type Team,
  type Invitation,
  type OrgRole,
} from './org-management';

// ---------------------------------------------------------------------------
// PLAN_LIMITS
// ---------------------------------------------------------------------------

describe('PLAN_LIMITS', () => {
  it('should define limits for the free plan', () => {
    expect(PLAN_LIMITS.free).toEqual({
      maxMembers: 5,
      maxTeams: 2,
      maxSpecs: 10,
    });
  });

  it('should define limits for the pro plan', () => {
    expect(PLAN_LIMITS.pro).toEqual({
      maxMembers: 50,
      maxTeams: 10,
      maxSpecs: 100,
    });
  });

  it('should define limits for the enterprise plan', () => {
    expect(PLAN_LIMITS.enterprise).toEqual({
      maxMembers: 999999,
      maxTeams: 999999,
      maxSpecs: 999999,
    });
  });

  it('should have the free plan with the lowest member limit', () => {
    expect(PLAN_LIMITS.free.maxMembers).toBeLessThan(PLAN_LIMITS.pro.maxMembers);
    expect(PLAN_LIMITS.pro.maxMembers).toBeLessThan(PLAN_LIMITS.enterprise.maxMembers);
  });

  it('should have exactly three plans', () => {
    expect(Object.keys(PLAN_LIMITS)).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// ROLE_HIERARCHY
// ---------------------------------------------------------------------------

describe('ROLE_HIERARCHY', () => {
  it('should assign owner the highest level (4)', () => {
    expect(ROLE_HIERARCHY.owner).toBe(4);
  });

  it('should assign admin level 3', () => {
    expect(ROLE_HIERARCHY.admin).toBe(3);
  });

  it('should assign member level 2', () => {
    expect(ROLE_HIERARCHY.member).toBe(2);
  });

  it('should assign viewer the lowest level (1)', () => {
    expect(ROLE_HIERARCHY.viewer).toBe(1);
  });

  it('should have exactly four roles', () => {
    expect(Object.keys(ROLE_HIERARCHY)).toHaveLength(4);
  });

  it('should maintain strict ordering: owner > admin > member > viewer', () => {
    expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.member);
    expect(ROLE_HIERARCHY.member).toBeGreaterThan(ROLE_HIERARCHY.viewer);
  });
});

// ---------------------------------------------------------------------------
// generateSlug
// ---------------------------------------------------------------------------

describe('generateSlug', () => {
  it('should lowercase the input', () => {
    expect(generateSlug('ACME')).toBe('acme');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('My Cool Org')).toBe('my-cool-org');
  });

  it('should replace special characters with hyphens', () => {
    expect(generateSlug('acme@corp!')).toBe('acme-corp');
  });

  it('should collapse consecutive hyphens', () => {
    expect(generateSlug('a---b')).toBe('a-b');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(generateSlug('---hello---')).toBe('hello');
  });

  it('should handle mixed-case with special characters', () => {
    expect(generateSlug('Hello World!! #123')).toBe('hello-world-123');
  });

  it('should handle a single word with no changes needed', () => {
    expect(generateSlug('simple')).toBe('simple');
  });

  it('should handle an empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should handle numeric strings', () => {
    expect(generateSlug('123 456')).toBe('123-456');
  });
});

// ---------------------------------------------------------------------------
// createOrganization
// ---------------------------------------------------------------------------

describe('createOrganization', () => {
  it('should default to the free plan', () => {
    const org = createOrganization('Test Org', 'user-1');
    expect(org.plan).toBe('free');
  });

  it('should use the specified plan', () => {
    const org = createOrganization('Pro Org', 'user-1', 'pro');
    expect(org.plan).toBe('pro');
  });

  it('should generate a slug from the name', () => {
    const org = createOrganization('My Cool Company', 'user-1');
    expect(org.slug).toBe('my-cool-company');
  });

  it('should set the name correctly', () => {
    const org = createOrganization('Acme Corp', 'user-1');
    expect(org.name).toBe('Acme Corp');
  });

  it('should generate an id starting with "org"', () => {
    const org = createOrganization('Test', 'user-1');
    expect(org.id).toMatch(/^org-/);
  });

  it('should set createdAt to a recent timestamp', () => {
    const before = Date.now();
    const org = createOrganization('Test', 'user-1');
    const after = Date.now();
    expect(org.createdAt).toBeGreaterThanOrEqual(before);
    expect(org.createdAt).toBeLessThanOrEqual(after);
  });

  it('should set maxMembers from the free plan limits', () => {
    const org = createOrganization('Free Org', 'user-1', 'free');
    expect(org.settings.maxMembers).toBe(5);
  });

  it('should set maxTeams from the pro plan limits', () => {
    const org = createOrganization('Pro Org', 'user-1', 'pro');
    expect(org.settings.maxTeams).toBe(10);
  });

  it('should enable SSO only for enterprise plans', () => {
    const free = createOrganization('Free', 'u1', 'free');
    const pro = createOrganization('Pro', 'u1', 'pro');
    const ent = createOrganization('Enterprise', 'u1', 'enterprise');
    expect(free.settings.ssoEnabled).toBe(false);
    expect(pro.settings.ssoEnabled).toBe(false);
    expect(ent.settings.ssoEnabled).toBe(true);
  });

  it('should set enterprise maxMembers from the enterprise plan limits', () => {
    const org = createOrganization('Enterprise Org', 'user-1', 'enterprise');
    expect(org.settings.maxMembers).toBe(999999);
  });
});

// ---------------------------------------------------------------------------
// canPerformAction
// ---------------------------------------------------------------------------

describe('canPerformAction', () => {
  it('should allow owner to perform any action', () => {
    expect(canPerformAction('owner', 'owner')).toBe(true);
    expect(canPerformAction('owner', 'admin')).toBe(true);
    expect(canPerformAction('owner', 'member')).toBe(true);
    expect(canPerformAction('owner', 'viewer')).toBe(true);
  });

  it('should allow viewer to perform viewer-level actions', () => {
    expect(canPerformAction('viewer', 'viewer')).toBe(true);
  });

  it('should deny viewer from performing admin actions', () => {
    expect(canPerformAction('viewer', 'admin')).toBe(false);
  });

  it('should deny viewer from performing member actions', () => {
    expect(canPerformAction('viewer', 'member')).toBe(false);
  });

  it('should allow admin to perform member-level actions', () => {
    expect(canPerformAction('admin', 'member')).toBe(true);
  });

  it('should deny admin from performing owner-level actions', () => {
    expect(canPerformAction('admin', 'owner')).toBe(false);
  });

  it('should allow equal roles (member vs member)', () => {
    expect(canPerformAction('member', 'member')).toBe(true);
  });

  it('should deny member from performing admin actions', () => {
    expect(canPerformAction('member', 'admin')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createInvitation
// ---------------------------------------------------------------------------

describe('createInvitation', () => {
  it('should create an invitation with pending status', () => {
    const inv = createInvitation('org-1', 'user@example.com', 'member', 'admin-1');
    expect(inv.status).toBe('pending');
  });

  it('should set the correct orgId', () => {
    const inv = createInvitation('org-42', 'a@b.com', 'viewer', 'user-1');
    expect(inv.orgId).toBe('org-42');
  });

  it('should set the correct email', () => {
    const inv = createInvitation('org-1', 'test@demo.example', 'member', 'admin-1');
    expect(inv.email).toBe('test@demo.example');
  });

  it('should set the correct role', () => {
    const inv = createInvitation('org-1', 'a@b.com', 'admin', 'owner-1');
    expect(inv.role).toBe('admin');
  });

  it('should set the invitedBy field', () => {
    const inv = createInvitation('org-1', 'a@b.com', 'member', 'inviter-99');
    expect(inv.invitedBy).toBe('inviter-99');
  });

  it('should set expiresAt to approximately 7 days from creation', () => {
    const before = Date.now();
    const inv = createInvitation('org-1', 'a@b.com', 'member', 'user-1');
    const after = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(inv.expiresAt).toBeGreaterThanOrEqual(before + sevenDaysMs);
    expect(inv.expiresAt).toBeLessThanOrEqual(after + sevenDaysMs);
  });

  it('should generate an id starting with "inv"', () => {
    const inv = createInvitation('org-1', 'a@b.com', 'member', 'user-1');
    expect(inv.id).toMatch(/^inv-/);
  });
});

// ---------------------------------------------------------------------------
// isInvitationValid
// ---------------------------------------------------------------------------

describe('isInvitationValid', () => {
  it('should return true for a valid pending invitation that has not expired', () => {
    const inv: Invitation = {
      id: 'inv-1',
      orgId: 'org-1',
      email: 'a@b.com',
      role: 'member',
      status: 'pending',
      invitedBy: 'user-1',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1_000_000,
    };
    expect(isInvitationValid(inv)).toBe(true);
  });

  it('should return false for an expired invitation', () => {
    const inv: Invitation = {
      id: 'inv-1',
      orgId: 'org-1',
      email: 'a@b.com',
      role: 'member',
      status: 'pending',
      invitedBy: 'user-1',
      createdAt: Date.now() - 1_000_000,
      expiresAt: Date.now() - 1,
    };
    expect(isInvitationValid(inv)).toBe(false);
  });

  it('should return false for an accepted invitation even if not expired', () => {
    const inv: Invitation = {
      id: 'inv-1',
      orgId: 'org-1',
      email: 'a@b.com',
      role: 'member',
      status: 'accepted',
      invitedBy: 'user-1',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1_000_000,
    };
    expect(isInvitationValid(inv)).toBe(false);
  });

  it('should return false for a declined invitation', () => {
    const inv: Invitation = {
      id: 'inv-1',
      orgId: 'org-1',
      email: 'a@b.com',
      role: 'member',
      status: 'declined',
      invitedBy: 'user-1',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1_000_000,
    };
    expect(isInvitationValid(inv)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addMemberToOrg
// ---------------------------------------------------------------------------

describe('addMemberToOrg', () => {
  let org: Organization;

  beforeEach(() => {
    org = createOrganization('Test Org', 'owner-1', 'free');
  });

  it('should add a member successfully when under the limit', () => {
    const members: OrgMember[] = [];
    const result = addMemberToOrg(org, members, 'user-2', 'u2@demo.example', 'User Two', 'member');
    expect(result).not.toBeNull();
    expect(result!.userId).toBe('user-2');
    expect(result!.email).toBe('u2@demo.example');
    expect(result!.displayName).toBe('User Two');
    expect(result!.role).toBe('member');
    expect(result!.orgId).toBe(org.id);
  });

  it('should return null when the org has reached its member limit', () => {
    // Free plan allows 5 members
    const members: OrgMember[] = Array.from({ length: 5 }, (_, i) => ({
      userId: `user-${i}`,
      orgId: org.id,
      role: 'member' as OrgRole,
      joinedAt: Date.now(),
      email: `user${i}@demo.example`,
      displayName: `User ${i}`,
    }));
    const result = addMemberToOrg(org, members, 'user-new', 'new@demo.example', 'New', 'member');
    expect(result).toBeNull();
  });

  it('should set joinedAt to a recent timestamp', () => {
    const before = Date.now();
    const result = addMemberToOrg(org, [], 'user-2', 'u2@demo.example', 'User Two', 'admin');
    const after = Date.now();
    expect(result).not.toBeNull();
    expect(result!.joinedAt).toBeGreaterThanOrEqual(before);
    expect(result!.joinedAt).toBeLessThanOrEqual(after);
  });

  it('should only count members belonging to the same org', () => {
    const members: OrgMember[] = Array.from({ length: 5 }, (_, i) => ({
      userId: `user-${i}`,
      orgId: 'some-other-org',
      role: 'member' as OrgRole,
      joinedAt: Date.now(),
      email: `user${i}@demo.example`,
      displayName: `User ${i}`,
    }));
    const result = addMemberToOrg(org, members, 'user-new', 'new@demo.example', 'New', 'member');
    expect(result).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// removeMember
// ---------------------------------------------------------------------------

describe('removeMember', () => {
  const orgId = 'org-1';
  let members: OrgMember[];

  beforeEach(() => {
    members = [
      { userId: 'owner-1', orgId, role: 'owner', joinedAt: 1000, email: 'owner@demo.example', displayName: 'Owner' },
      { userId: 'admin-1', orgId, role: 'admin', joinedAt: 2000, email: 'admin@demo.example', displayName: 'Admin' },
      { userId: 'member-1', orgId, role: 'member', joinedAt: 3000, email: 'member@demo.example', displayName: 'Member' },
    ];
  });

  it('should remove a regular member', () => {
    const result = removeMember(members, 'member-1', orgId);
    expect(result).toHaveLength(2);
    expect(result.find((m) => m.userId === 'member-1')).toBeUndefined();
  });

  it('should not remove the owner', () => {
    const result = removeMember(members, 'owner-1', orgId);
    expect(result).toHaveLength(3);
    expect(result.find((m) => m.userId === 'owner-1')).toBeDefined();
  });

  it('should return the same list when the user does not exist', () => {
    const result = removeMember(members, 'nonexistent', orgId);
    expect(result).toHaveLength(3);
  });

  it('should not remove a member from a different org', () => {
    const result = removeMember(members, 'member-1', 'different-org');
    expect(result).toHaveLength(3);
  });

  it('should remove an admin member', () => {
    const result = removeMember(members, 'admin-1', orgId);
    expect(result).toHaveLength(2);
    expect(result.find((m) => m.userId === 'admin-1')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// createTeam
// ---------------------------------------------------------------------------

describe('createTeam', () => {
  it('should create a team with the provided fields', () => {
    const team = createTeam('org-1', 'Engineering', 'The engineering team', ['u1', 'u2']);
    expect(team.orgId).toBe('org-1');
    expect(team.name).toBe('Engineering');
    expect(team.description).toBe('The engineering team');
    expect(team.memberIds).toEqual(['u1', 'u2']);
  });

  it('should default memberIds to an empty array', () => {
    const team = createTeam('org-1', 'Design', 'Design team');
    expect(team.memberIds).toEqual([]);
  });

  it('should generate an id starting with "team"', () => {
    const team = createTeam('org-1', 'QA', 'QA team');
    expect(team.id).toMatch(/^team-/);
  });

  it('should set createdAt to a recent timestamp', () => {
    const before = Date.now();
    const team = createTeam('org-1', 'Ops', 'Operations');
    const after = Date.now();
    expect(team.createdAt).toBeGreaterThanOrEqual(before);
    expect(team.createdAt).toBeLessThanOrEqual(after);
  });
});

// ---------------------------------------------------------------------------
// getTeamMembers
// ---------------------------------------------------------------------------

describe('getTeamMembers', () => {
  const allMembers: OrgMember[] = [
    { userId: 'u1', orgId: 'org-1', role: 'admin', joinedAt: 1000, email: 'u1@demo.example', displayName: 'U1' },
    { userId: 'u2', orgId: 'org-1', role: 'member', joinedAt: 2000, email: 'u2@demo.example', displayName: 'U2' },
    { userId: 'u3', orgId: 'org-1', role: 'viewer', joinedAt: 3000, email: 'u3@demo.example', displayName: 'U3' },
  ];

  it('should return only members whose userId is in the team', () => {
    const team: Team = {
      id: 'team-1',
      orgId: 'org-1',
      name: 'Alpha',
      description: '',
      memberIds: ['u1', 'u3'],
      createdAt: Date.now(),
    };
    const result = getTeamMembers(team, allMembers);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.userId)).toEqual(expect.arrayContaining(['u1', 'u3']));
  });

  it('should return an empty array when the team has no members', () => {
    const team: Team = {
      id: 'team-2',
      orgId: 'org-1',
      name: 'Empty',
      description: '',
      memberIds: [],
      createdAt: Date.now(),
    };
    const result = getTeamMembers(team, allMembers);
    expect(result).toHaveLength(0);
  });

  it('should return an empty array when memberIds do not match any allMembers', () => {
    const team: Team = {
      id: 'team-3',
      orgId: 'org-1',
      name: 'Ghost',
      description: '',
      memberIds: ['u99', 'u100'],
      createdAt: Date.now(),
    };
    const result = getTeamMembers(team, allMembers);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getMemberRole
// ---------------------------------------------------------------------------

describe('getMemberRole', () => {
  const members: OrgMember[] = [
    { userId: 'u1', orgId: 'org-1', role: 'owner', joinedAt: 1000, email: 'u1@demo.example', displayName: 'U1' },
    { userId: 'u2', orgId: 'org-1', role: 'admin', joinedAt: 2000, email: 'u2@demo.example', displayName: 'U2' },
    { userId: 'u3', orgId: 'org-2', role: 'viewer', joinedAt: 3000, email: 'u3@demo.example', displayName: 'U3' },
  ];

  it('should return the correct role for an existing member', () => {
    expect(getMemberRole(members, 'u1', 'org-1')).toBe('owner');
  });

  it('should return null for a user not in the org', () => {
    expect(getMemberRole(members, 'nonexistent', 'org-1')).toBeNull();
  });

  it('should differentiate by orgId', () => {
    expect(getMemberRole(members, 'u3', 'org-1')).toBeNull();
    expect(getMemberRole(members, 'u3', 'org-2')).toBe('viewer');
  });
});

// ---------------------------------------------------------------------------
// updateMemberRole
// ---------------------------------------------------------------------------

describe('updateMemberRole', () => {
  const orgId = 'org-1';
  let members: OrgMember[];

  beforeEach(() => {
    members = [
      { userId: 'u1', orgId, role: 'member', joinedAt: 1000, email: 'u1@demo.example', displayName: 'U1' },
      { userId: 'u2', orgId, role: 'viewer', joinedAt: 2000, email: 'u2@demo.example', displayName: 'U2' },
      { userId: 'u3', orgId, role: 'admin', joinedAt: 3000, email: 'u3@demo.example', displayName: 'U3' },
    ];
  });

  it('should update the role when the actor outranks both current and new role', () => {
    // owner (4) > member (2) and owner (4) > admin (3)
    const result = updateMemberRole(members, 'u1', orgId, 'admin', 'owner');
    expect(result).not.toBeNull();
    const updated = result!.find((m) => m.userId === 'u1');
    expect(updated!.role).toBe('admin');
  });

  it('should return null if the actor does not outrank the current role', () => {
    // admin (3) cannot change admin (3) because 3 is not > 3
    const result = updateMemberRole(members, 'u3', orgId, 'member', 'admin');
    expect(result).toBeNull();
  });

  it('should return null if the actor does not outrank the new role', () => {
    // admin (3) cannot promote to admin (3) because 3 is not > 3
    const result = updateMemberRole(members, 'u2', orgId, 'admin', 'admin');
    expect(result).toBeNull();
  });

  it('should return null if the target user does not exist', () => {
    const result = updateMemberRole(members, 'nonexistent', orgId, 'admin', 'owner');
    expect(result).toBeNull();
  });

  it('should not mutate the original members array', () => {
    const original = members.map((m) => ({ ...m }));
    updateMemberRole(members, 'u1', orgId, 'admin', 'owner');
    expect(members).toEqual(original);
  });

  it('should preserve other members unchanged', () => {
    const result = updateMemberRole(members, 'u2', orgId, 'member', 'owner');
    expect(result).not.toBeNull();
    const u1 = result!.find((m) => m.userId === 'u1');
    expect(u1!.role).toBe('member');
  });

  it('should allow owner to demote an admin to viewer', () => {
    const result = updateMemberRole(members, 'u3', orgId, 'viewer', 'owner');
    expect(result).not.toBeNull();
    const u3 = result!.find((m) => m.userId === 'u3');
    expect(u3!.role).toBe('viewer');
  });

  it('should return null when a member tries to change another member', () => {
    // member (2) cannot change viewer (1) to member (2) because 2 is not > 2
    const result = updateMemberRole(members, 'u2', orgId, 'member', 'member');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getOrgStats
// ---------------------------------------------------------------------------

describe('getOrgStats', () => {
  let org: Organization;

  beforeEach(() => {
    org = createOrganization('Stats Org', 'owner-1', 'free');
  });

  it('should return correct member and team counts', () => {
    const members: OrgMember[] = [
      { userId: 'u1', orgId: org.id, role: 'owner', joinedAt: 1000, email: 'u1@demo.example', displayName: 'U1' },
      { userId: 'u2', orgId: org.id, role: 'member', joinedAt: 2000, email: 'u2@demo.example', displayName: 'U2' },
    ];
    const teams: Team[] = [
      { id: 'team-1', orgId: org.id, name: 'T1', description: '', memberIds: [], createdAt: 1000 },
    ];
    const stats = getOrgStats(org, members, teams);
    expect(stats.memberCount).toBe(2);
    expect(stats.teamCount).toBe(1);
  });

  it('should return correct limits from the organization settings', () => {
    const stats = getOrgStats(org, [], []);
    expect(stats.memberLimit).toBe(5);
    expect(stats.teamLimit).toBe(2);
  });

  it('should calculate utilization as 0% when there are no members or teams', () => {
    const stats = getOrgStats(org, [], []);
    expect(stats.utilizationPercent).toBe(0);
  });

  it('should calculate correct utilization percentage', () => {
    // free plan: maxMembers=5, maxTeams=2
    // 2/5 = 0.4, 1/2 = 0.5, avg = 0.45, round(0.45*100) = 45
    const members: OrgMember[] = [
      { userId: 'u1', orgId: org.id, role: 'owner', joinedAt: 1000, email: 'u1@demo.example', displayName: 'U1' },
      { userId: 'u2', orgId: org.id, role: 'member', joinedAt: 2000, email: 'u2@demo.example', displayName: 'U2' },
    ];
    const teams: Team[] = [
      { id: 'team-1', orgId: org.id, name: 'T1', description: '', memberIds: [], createdAt: 1000 },
    ];
    const stats = getOrgStats(org, members, teams);
    expect(stats.utilizationPercent).toBe(45);
  });

  it('should ignore members and teams from other orgs', () => {
    const members: OrgMember[] = [
      { userId: 'u1', orgId: 'other-org', role: 'owner', joinedAt: 1000, email: 'u1@demo.example', displayName: 'U1' },
    ];
    const teams: Team[] = [
      { id: 'team-1', orgId: 'other-org', name: 'T1', description: '', memberIds: [], createdAt: 1000 },
    ];
    const stats = getOrgStats(org, members, teams);
    expect(stats.memberCount).toBe(0);
    expect(stats.teamCount).toBe(0);
  });

  it('should calculate 100% utilization when limits are fully used', () => {
    // free: maxMembers=5, maxTeams=2
    const members: OrgMember[] = Array.from({ length: 5 }, (_, i) => ({
      userId: `u${i}`,
      orgId: org.id,
      role: 'member' as OrgRole,
      joinedAt: 1000,
      email: `u${i}@demo.example`,
      displayName: `U${i}`,
    }));
    const teams: Team[] = [
      { id: 'team-1', orgId: org.id, name: 'T1', description: '', memberIds: [], createdAt: 1000 },
      { id: 'team-2', orgId: org.id, name: 'T2', description: '', memberIds: [], createdAt: 1000 },
    ];
    const stats = getOrgStats(org, members, teams);
    // 5/5 = 1.0, 2/2 = 1.0, avg = 1.0, round(1.0*100) = 100
    expect(stats.utilizationPercent).toBe(100);
  });
});
