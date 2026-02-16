import { describe, it, expect } from 'vitest';
import commentsReducer, {
  addComment,
  setCommentStatus,
  setCommentsForTarget,
  setNotifications,
  selectCommentCountForTarget,
} from './comments-slice';
import type { Comment } from '@/types/comments';
import type { CommentNotification } from '@/types/comments';

describe('comments-slice', () => {
  const comment: Comment = {
    id: 'comment-1',
    targetType: 'epic',
    targetId: 'epic-1',
    parentId: null,
    authorId: 'user-1',
    authorName: 'Avery Kim',
    authorEmail: 'avery@example.com',
    body: 'Initial comment',
    mentions: [],
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  it('adds comments and indexes by target', () => {
    const state = commentsReducer(undefined, addComment(comment));
    const key = 'epic:epic-1';
    expect(state.commentsById['comment-1']).toBeDefined();
    expect(state.targetIndex[key]).toContain('comment-1');
  });

  it('sets comment status', () => {
    const initial = commentsReducer(undefined, addComment(comment));
    const resolved = commentsReducer(
      initial,
      setCommentStatus({
        id: 'comment-1',
        status: 'resolved',
        resolvedAt: '2026-02-03T10:00:00.000Z',
        resolvedBy: 'user-1',
      })
    );
    expect(resolved.commentsById['comment-1']?.status).toBe('resolved');
  });

  it('replaces comments for a target', () => {
    const replacement: Comment = {
      ...comment,
      id: 'comment-2',
      body: 'Replacement comment',
    };
    const state = commentsReducer(
      undefined,
      setCommentsForTarget({
        targetType: 'epic',
        targetId: 'epic-1',
        comments: [replacement],
      })
    );
    expect(state.targetIndex['epic:epic-1']).toEqual(['comment-2']);
  });

  it('selectCommentCountForTarget counts open and resolved', () => {
    const resolved: Comment = {
      ...comment,
      id: 'comment-resolved',
      status: 'resolved',
    };
    let state = commentsReducer(undefined, addComment(comment));
    state = commentsReducer(state, addComment(resolved));

    const mockRoot = { comments: state } as never;
    const counts = selectCommentCountForTarget(mockRoot, 'epic', 'epic-1');

    expect(counts.open).toBe(1);
    expect(counts.resolved).toBe(1);
    expect(counts.total).toBe(2);
  });

  it('selectCommentCountForTarget excludes deleted comments', () => {
    const deleted: Comment = {
      ...comment,
      id: 'comment-deleted',
      isDeleted: true,
    };
    let state = commentsReducer(undefined, addComment(comment));
    state = commentsReducer(state, addComment(deleted));

    const mockRoot = { comments: state } as never;
    const counts = selectCommentCountForTarget(mockRoot, 'epic', 'epic-1');

    expect(counts.total).toBe(1);
  });

  it('selectCommentCountForTarget returns zeros for unknown target', () => {
    const state = commentsReducer(undefined, addComment(comment));
    const mockRoot = { comments: state } as never;
    const counts = selectCommentCountForTarget(mockRoot, 'task', 'nonexistent');

    expect(counts).toEqual({ open: 0, resolved: 0, total: 0 });
  });

  it('sets notifications list', () => {
    const notifications: CommentNotification[] = [
      {
        id: 'notif-1',
        commentId: 'comment-1',
        userId: 'user-1',
        channel: 'in-app',
        status: 'unread',
        createdAt: '2026-02-03T10:00:00.000Z',
      },
    ];
    const state = commentsReducer(undefined, setNotifications(notifications));
    expect(state.notifications).toEqual(notifications);
  });
});
