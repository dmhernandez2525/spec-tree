import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import CommentItem, { CommentNode } from './comment-item';
import type { MentionCandidate } from '@/types/comments';

const mentionCandidates: MentionCandidate[] = [
  {
    id: 'user-1',
    label: 'Jane Doe',
    value: 'jane',
  },
];

const baseComment: CommentNode = {
  id: 'comment-1',
  targetType: 'feature',
  targetId: 'feature-1',
  authorId: 'user-1',
  authorName: 'Jane Doe',
  body: 'Looks good',
  mentions: [],
  status: 'open',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('CommentItem', () => {
  it('renders comment and triggers resolve action', async () => {
    const onReply = vi.fn(async () => undefined);
    const onResolve = vi.fn(async () => undefined);
    const onReopen = vi.fn(async () => undefined);
    const onDelete = vi.fn(async () => undefined);

    const { user } = render(
      <CommentItem
        comment={baseComment}
        replies={[]}
        mentionCandidates={mentionCandidates}
        currentUserId="user-1" // Must match authorId for permission to resolve
        onReply={onReply}
        onResolve={onResolve}
        onReopen={onReopen}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Looks good')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /resolve/i }));

    expect(onResolve).toHaveBeenCalledWith('comment-1');
  });

  it('disables resolve button when user is not authorized', async () => {
    const onReply = vi.fn(async () => undefined);
    const onResolve = vi.fn(async () => undefined);
    const onReopen = vi.fn(async () => undefined);
    const onDelete = vi.fn(async () => undefined);

    render(
      <CommentItem
        comment={baseComment}
        replies={[]}
        mentionCandidates={mentionCandidates}
        currentUserId="other-user" // Different from authorId
        userRole="member" // Not an admin role
        onReply={onReply}
        onResolve={onResolve}
        onReopen={onReopen}
        onDelete={onDelete}
      />
    );

    const resolveButton = screen.getByRole('button', { name: /resolve/i });
    expect(resolveButton).toBeDisabled();
  });

  it('allows admin to resolve other users comments', async () => {
    const onReply = vi.fn(async () => undefined);
    const onResolve = vi.fn(async () => undefined);
    const onReopen = vi.fn(async () => undefined);
    const onDelete = vi.fn(async () => undefined);

    const { user } = render(
      <CommentItem
        comment={baseComment}
        replies={[]}
        mentionCandidates={mentionCandidates}
        currentUserId="admin-user" // Different from authorId
        userRole="admin" // Admin role grants permission
        onReply={onReply}
        onResolve={onResolve}
        onReopen={onReopen}
        onDelete={onDelete}
      />
    );

    const resolveButton = screen.getByRole('button', { name: /resolve/i });
    expect(resolveButton).not.toBeDisabled();

    await user.click(resolveButton);
    expect(onResolve).toHaveBeenCalledWith('comment-1');
  });

  it('prevents admin from deleting other users comments', async () => {
    const onReply = vi.fn(async () => undefined);
    const onResolve = vi.fn(async () => undefined);
    const onReopen = vi.fn(async () => undefined);
    const onDelete = vi.fn(async () => undefined);

    render(
      <CommentItem
        comment={baseComment}
        replies={[]}
        mentionCandidates={mentionCandidates}
        currentUserId="admin-user" // Different from authorId
        userRole="admin" // Admin role does NOT grant delete permission
        onReply={onReply}
        onResolve={onResolve}
        onReopen={onReopen}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeDisabled();
  });
});
