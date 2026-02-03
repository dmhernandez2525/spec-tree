import type { Comment } from '@/types/comments';
import type { OrganizationRole } from '@/types/organization';

/**
 * Permission levels for comment operations
 */
export interface CommentPermissions {
  canDelete: boolean;
  canResolve: boolean;
  canReopen: boolean;
  canEdit: boolean;
}

/**
 * Roles that have elevated permissions (can resolve/reopen any comment)
 */
const ADMIN_ROLES: OrganizationRole[] = ['owner', 'admin'];

/**
 * Check if a user has admin-level permissions for comments
 */
export const isCommentAdmin = (userRole?: OrganizationRole): boolean => {
  return userRole !== undefined && ADMIN_ROLES.includes(userRole);
};

/**
 * Check if a user is the author of a comment
 */
export const isCommentAuthor = (
  comment: Comment,
  currentUserId: string | undefined
): boolean => {
  if (!currentUserId) return false;
  return comment.authorId === currentUserId;
};

/**
 * Get permissions for a specific comment based on the current user
 *
 * Permission rules:
 * - Delete: Only the comment author can delete their own comment
 * - Resolve/Reopen: Comment author OR project admins (owner, admin roles)
 * - Edit: Only the comment author can edit their own comment
 */
export const getCommentPermissions = (
  comment: Comment,
  currentUserId: string | undefined,
  userRole?: OrganizationRole
): CommentPermissions => {
  const isAuthor = isCommentAuthor(comment, currentUserId);
  const isAdmin = isCommentAdmin(userRole);

  return {
    canDelete: isAuthor,
    canResolve: isAuthor || isAdmin,
    canReopen: isAuthor || isAdmin,
    canEdit: isAuthor,
  };
};

/**
 * Check if a user can perform a specific action on a comment
 */
export const canPerformCommentAction = (
  action: 'delete' | 'resolve' | 'reopen' | 'edit',
  comment: Comment,
  currentUserId: string | undefined,
  userRole?: OrganizationRole
): boolean => {
  const permissions = getCommentPermissions(comment, currentUserId, userRole);

  switch (action) {
    case 'delete':
      return permissions.canDelete;
    case 'resolve':
      return permissions.canResolve;
    case 'reopen':
      return permissions.canReopen;
    case 'edit':
      return permissions.canEdit;
    default:
      return false;
  }
};
