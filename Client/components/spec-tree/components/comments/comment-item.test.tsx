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
});
