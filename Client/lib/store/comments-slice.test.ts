import { describe, it, expect } from 'vitest';
import commentsReducer, {
  addComment,
  setCommentStatus,
  setCommentsForTarget,
  setNotifications,
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
