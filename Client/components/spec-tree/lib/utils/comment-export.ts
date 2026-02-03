import type { RootState } from '@/lib/store';
import type { Comment, CommentTargetType } from '@/types/comments';

const normalizeBody = (body: string | undefined): string => {
  if (!body) return 'Comment deleted';
  return body.trim().replace(/\s+/g, ' ');
};

export const getCommentsForTarget = (
  state: RootState,
  targetType: CommentTargetType,
  targetId: string
): Comment[] => {
  const comments = Object.values(state.comments?.commentsById || {}) as Comment[];
  return comments
    .filter((comment) => comment.targetType === targetType && comment.targetId === targetId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const buildCommentLines = (comments: Comment[]): string[] => {
  if (comments.length === 0) return [];
  return comments.map((comment) => {
    const statusLabel = comment.status === 'resolved' ? 'Resolved' : 'Open';
    const replyLabel = comment.parentId ? ` Reply to ${comment.parentId}.` : '';
    return `- ${comment.authorName || 'Unknown'} (${statusLabel}).${replyLabel} ${normalizeBody(comment.body)}`;
  });
};

export const appendCommentSection = (
  lines: string[],
  comments: Comment[],
  heading: string
): void => {
  if (comments.length === 0) return;
  lines.push(heading);
  lines.push('');
  lines.push(...buildCommentLines(comments));
  lines.push('');
};
