/**
 * Authentication and Authorization Utilities
 *
 * Provides role-based access control, permission checking, and session
 * validation helpers for the SpecTree application.
 */

export type Permission = 'read' | 'write' | 'admin' | 'delete' | 'export' | 'manage-users';

export interface SessionInfo {
  userId: string;
  role: string;
  expiresAt: number;
  permissions: Permission[];
}

/**
 * Maps each role to its set of permissions.
 * Roles are hierarchical: admin includes all permissions,
 * editor includes read/write/export, viewer includes only read.
 */
export const RolePermissions: Record<string, Permission[]> = {
  viewer: ['read'],
  editor: ['read', 'write', 'export'],
  admin: ['read', 'write', 'admin', 'delete', 'export', 'manage-users'],
} as const;

/**
 * Check if a role includes a specific permission.
 */
export function hasPermission(userRole: string, requiredPermission: Permission): boolean {
  const permissions = RolePermissions[userRole];
  if (!permissions) return false;
  return permissions.includes(requiredPermission);
}

/**
 * Check if a role has at least one of the specified permissions.
 */
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(userRole, p));
}

/**
 * Check if a role has all of the specified permissions.
 */
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(userRole, p));
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'SESSION_EXPIRED',
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Require a valid, non-expired session. Throws AuthError if the
 * session is null, undefined, or expired.
 */
export function requireAuth(session: SessionInfo | null | undefined): SessionInfo {
  if (!session) {
    throw new AuthError('Authentication required', 'UNAUTHENTICATED');
  }

  if (isTokenExpired(session.expiresAt)) {
    throw new AuthError('Session has expired', 'SESSION_EXPIRED');
  }

  return session;
}

/**
 * Require that the session user has a specific permission.
 * Throws AuthError if the user lacks the required permission.
 */
export function requirePermission(
  session: SessionInfo | null | undefined,
  permission: Permission,
): SessionInfo {
  const validSession = requireAuth(session);

  if (!hasPermission(validSession.role, permission)) {
    throw new AuthError(
      `Permission '${permission}' is required for this action`,
      'UNAUTHORIZED',
    );
  }

  return validSession;
}

/**
 * Check if a token/session expiration timestamp is in the past.
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}
