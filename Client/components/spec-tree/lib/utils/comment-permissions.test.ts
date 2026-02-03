import { describe, it, expect } from 'vitest';
import type { Comment } from '@/types/comments';
import {
  isCommentAdmin,
  isCommentAuthor,
  getCommentPermissions,
  canPerformCommentAction,
} from './comment-permissions';

const createMockComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'comment-1',
  targetType: 'feature',
  targetId: 'feature-1',
  authorId: 'user-123',
  authorName: 'John Doe',
  body: 'This is a test comment',
  mentions: [],
  status: 'open',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('comment-permissions', () => {
  describe('isCommentAdmin', () => {
    it('should return true for owner role', () => {
      expect(isCommentAdmin('owner')).toBe(true);
    });

    it('should return true for admin role', () => {
      expect(isCommentAdmin('admin')).toBe(true);
    });

    it('should return false for manager role', () => {
      expect(isCommentAdmin('manager')).toBe(false);
    });

    it('should return false for member role', () => {
      expect(isCommentAdmin('member')).toBe(false);
    });

    it('should return false for viewer role', () => {
      expect(isCommentAdmin('viewer')).toBe(false);
    });

    it('should return false for undefined role', () => {
      expect(isCommentAdmin(undefined)).toBe(false);
    });
  });

  describe('isCommentAuthor', () => {
    const comment = createMockComment({ authorId: 'user-123' });

    it('should return true if user is the author', () => {
      expect(isCommentAuthor(comment, 'user-123')).toBe(true);
    });

    it('should return false if user is not the author', () => {
      expect(isCommentAuthor(comment, 'user-456')).toBe(false);
    });

    it('should return false if currentUserId is undefined', () => {
      expect(isCommentAuthor(comment, undefined)).toBe(false);
    });
  });

  describe('getCommentPermissions', () => {
    describe('for comment author', () => {
      const comment = createMockComment({ authorId: 'user-123' });

      it('should allow all operations for the author', () => {
        const permissions = getCommentPermissions(comment, 'user-123');

        expect(permissions.canDelete).toBe(true);
        expect(permissions.canResolve).toBe(true);
        expect(permissions.canReopen).toBe(true);
        expect(permissions.canEdit).toBe(true);
      });

      it('should allow all operations for the author even without admin role', () => {
        const permissions = getCommentPermissions(comment, 'user-123', 'viewer');

        expect(permissions.canDelete).toBe(true);
        expect(permissions.canResolve).toBe(true);
        expect(permissions.canReopen).toBe(true);
        expect(permissions.canEdit).toBe(true);
      });
    });

    describe('for non-author with admin role', () => {
      const comment = createMockComment({ authorId: 'user-123' });

      it('should allow resolve/reopen but not delete/edit for admin', () => {
        const permissions = getCommentPermissions(comment, 'user-456', 'admin');

        expect(permissions.canDelete).toBe(false);
        expect(permissions.canResolve).toBe(true);
        expect(permissions.canReopen).toBe(true);
        expect(permissions.canEdit).toBe(false);
      });

      it('should allow resolve/reopen but not delete/edit for owner', () => {
        const permissions = getCommentPermissions(comment, 'user-456', 'owner');

        expect(permissions.canDelete).toBe(false);
        expect(permissions.canResolve).toBe(true);
        expect(permissions.canReopen).toBe(true);
        expect(permissions.canEdit).toBe(false);
      });
    });

    describe('for non-author without admin role', () => {
      const comment = createMockComment({ authorId: 'user-123' });

      it('should deny all operations for member role', () => {
        const permissions = getCommentPermissions(comment, 'user-456', 'member');

        expect(permissions.canDelete).toBe(false);
        expect(permissions.canResolve).toBe(false);
        expect(permissions.canReopen).toBe(false);
        expect(permissions.canEdit).toBe(false);
      });

      it('should deny all operations for viewer role', () => {
        const permissions = getCommentPermissions(comment, 'user-456', 'viewer');

        expect(permissions.canDelete).toBe(false);
        expect(permissions.canResolve).toBe(false);
        expect(permissions.canReopen).toBe(false);
        expect(permissions.canEdit).toBe(false);
      });

      it('should deny all operations when no role is provided', () => {
        const permissions = getCommentPermissions(comment, 'user-456');

        expect(permissions.canDelete).toBe(false);
        expect(permissions.canResolve).toBe(false);
        expect(permissions.canReopen).toBe(false);
        expect(permissions.canEdit).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should deny all operations when currentUserId is undefined', () => {
        const comment = createMockComment({ authorId: 'user-123' });
        const permissions = getCommentPermissions(comment, undefined, 'admin');

        expect(permissions.canDelete).toBe(false);
        expect(permissions.canResolve).toBe(true); // Admin can still resolve
        expect(permissions.canReopen).toBe(true); // Admin can still reopen
        expect(permissions.canEdit).toBe(false);
      });
    });
  });

  describe('canPerformCommentAction', () => {
    const comment = createMockComment({ authorId: 'user-123' });

    it('should return true for delete action by author', () => {
      expect(canPerformCommentAction('delete', comment, 'user-123')).toBe(true);
    });

    it('should return false for delete action by non-author', () => {
      expect(canPerformCommentAction('delete', comment, 'user-456', 'admin')).toBe(false);
    });

    it('should return true for resolve action by admin', () => {
      expect(canPerformCommentAction('resolve', comment, 'user-456', 'admin')).toBe(true);
    });

    it('should return true for reopen action by owner', () => {
      expect(canPerformCommentAction('reopen', comment, 'user-456', 'owner')).toBe(true);
    });

    it('should return false for resolve action by member', () => {
      expect(canPerformCommentAction('resolve', comment, 'user-456', 'member')).toBe(false);
    });

    it('should return true for edit action by author', () => {
      expect(canPerformCommentAction('edit', comment, 'user-123')).toBe(true);
    });

    it('should return false for edit action by non-author', () => {
      expect(canPerformCommentAction('edit', comment, 'user-456', 'admin')).toBe(false);
    });
  });
});
