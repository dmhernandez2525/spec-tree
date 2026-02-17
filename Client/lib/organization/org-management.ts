// Organization Management Module (F12.1)
// Manages organizations, teams, members, roles, and invitations.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface OrgSettings {
  maxMembers: number;
  maxTeams: number;
  ssoEnabled: boolean;
  domainRestriction?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: number;
  settings: OrgSettings;
}

export interface OrgMember {
  userId: string;
  orgId: string;
  role: OrgRole;
  joinedAt: number;
  email: string;
  displayName: string;
}

export interface Team {
  id: string;
  orgId: string;
  name: string;
  description: string;
  memberIds: string[];
  createdAt: number;
}

export interface Invitation {
  id: string;
  orgId: string;
  email: string;
  role: OrgRole;
  status: InviteStatus;
  invitedBy: string;
  createdAt: number;
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PLAN_LIMITS: Record<
  Organization['plan'],
  { maxMembers: number; maxTeams: number; maxSpecs: number }
> = {
  free: { maxMembers: 5, maxTeams: 2, maxSpecs: 10 },
  pro: { maxMembers: 50, maxTeams: 10, maxSpecs: 100 },
  enterprise: { maxMembers: 999999, maxTeams: 999999, maxSpecs: 999999 },
};

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Generate a URL-safe slug from a name.
 * Lowercases the input, replaces spaces and special characters with hyphens,
 * collapses consecutive hyphens, and trims leading/trailing hyphens.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Create a new organization with sensible defaults derived from the chosen plan.
 */
export function createOrganization(
  name: string,
  ownerUserId: string,
  plan: Organization['plan'] = 'free',
): Organization {
  const limits = PLAN_LIMITS[plan];

  return {
    id: generateId('org'),
    name,
    slug: generateSlug(name),
    plan,
    createdAt: Date.now(),
    settings: {
      maxMembers: limits.maxMembers,
      maxTeams: limits.maxTeams,
      ssoEnabled: plan === 'enterprise',
    },
  };
}

/**
 * Check whether the actor's role is high enough to perform an action that
 * requires `requiredRole`.
 */
export function canPerformAction(
  actorRole: OrgRole,
  requiredRole: OrgRole,
): boolean {
  return ROLE_HIERARCHY[actorRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Create a new invitation with a 7-day expiry window.
 */
export function createInvitation(
  orgId: string,
  email: string,
  role: OrgRole,
  invitedBy: string,
): Invitation {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  return {
    id: generateId('inv'),
    orgId,
    email,
    role,
    status: 'pending',
    invitedBy,
    createdAt: now,
    expiresAt: now + sevenDaysMs,
  };
}

/**
 * Determine whether an invitation is still valid (not expired and still pending).
 */
export function isInvitationValid(invitation: Invitation): boolean {
  if (invitation.status !== 'pending') {
    return false;
  }
  return Date.now() < invitation.expiresAt;
}

/**
 * Add a member to an organization. Returns `null` if the organization has
 * already reached its member limit.
 */
export function addMemberToOrg(
  org: Organization,
  members: OrgMember[],
  userId: string,
  email: string,
  displayName: string,
  role: OrgRole,
): OrgMember | null {
  const currentCount = members.filter((m) => m.orgId === org.id).length;

  if (currentCount >= org.settings.maxMembers) {
    return null;
  }

  return {
    userId,
    orgId: org.id,
    role,
    joinedAt: Date.now(),
    email,
    displayName,
  };
}

/**
 * Remove a member from an organization. The owner cannot be removed.
 * Returns the filtered member list.
 */
export function removeMember(
  members: OrgMember[],
  userId: string,
  orgId: string,
): OrgMember[] {
  const target = members.find(
    (m) => m.userId === userId && m.orgId === orgId,
  );

  if (!target || target.role === 'owner') {
    return members;
  }

  return members.filter(
    (m) => !(m.userId === userId && m.orgId === orgId),
  );
}

/**
 * Create a new team within an organization.
 */
export function createTeam(
  orgId: string,
  name: string,
  description: string,
  memberIds: string[] = [],
): Team {
  return {
    id: generateId('team'),
    orgId,
    name,
    description,
    memberIds,
    createdAt: Date.now(),
  };
}

/**
 * Retrieve the OrgMember records for every user in a given team.
 */
export function getTeamMembers(
  team: Team,
  allMembers: OrgMember[],
): OrgMember[] {
  return allMembers.filter((m) => team.memberIds.includes(m.userId));
}

/**
 * Look up a member's role within a specific organization. Returns `null` if
 * the user is not a member.
 */
export function getMemberRole(
  members: OrgMember[],
  userId: string,
  orgId: string,
): OrgRole | null {
  const member = members.find(
    (m) => m.userId === userId && m.orgId === orgId,
  );
  return member ? member.role : null;
}

/**
 * Update a member's role. Returns `null` if the actor does not have
 * sufficient privileges (the actor must outrank both the member's current
 * role and the target role). Returns the updated member list on success.
 */
export function updateMemberRole(
  members: OrgMember[],
  userId: string,
  orgId: string,
  newRole: OrgRole,
  actorRole: OrgRole,
): OrgMember[] | null {
  const target = members.find(
    (m) => m.userId === userId && m.orgId === orgId,
  );

  if (!target) {
    return null;
  }

  // The actor must outrank the member's current role and the desired new role.
  const actorLevel = ROLE_HIERARCHY[actorRole];
  if (
    actorLevel <= ROLE_HIERARCHY[target.role] ||
    actorLevel <= ROLE_HIERARCHY[newRole]
  ) {
    return null;
  }

  return members.map((m) => {
    if (m.userId === userId && m.orgId === orgId) {
      return { ...m, role: newRole };
    }
    return m;
  });
}

/**
 * Compute high-level statistics for an organization including member/team
 * counts, limits, and overall utilization percentage.
 */
export function getOrgStats(
  org: Organization,
  members: OrgMember[],
  teams: Team[],
): {
  memberCount: number;
  teamCount: number;
  memberLimit: number;
  teamLimit: number;
  utilizationPercent: number;
} {
  const memberCount = members.filter((m) => m.orgId === org.id).length;
  const teamCount = teams.filter((t) => t.orgId === org.id).length;
  const memberLimit = org.settings.maxMembers;
  const teamLimit = org.settings.maxTeams;

  // Utilization is the average of member and team usage percentages.
  const memberUtil = memberLimit > 0 ? memberCount / memberLimit : 0;
  const teamUtil = teamLimit > 0 ? teamCount / teamLimit : 0;
  const utilizationPercent = Math.round(((memberUtil + teamUtil) / 2) * 100);

  return {
    memberCount,
    teamCount,
    memberLimit,
    teamLimit,
    utilizationPercent,
  };
}
