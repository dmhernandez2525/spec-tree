import { describe, it, expect } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import { CommentCountBadge } from './comment-count-badge';

describe('CommentCountBadge', () => {
  it('returns null when no comments exist', () => {
    const { container } = render(
      <CommentCountBadge targetType="epic" targetId="epic-no-comments" />,
      { initialState: { comments: { commentsById: {}, targetIndex: {}, notifications: [] } } as never }
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders badge with total comment count', () => {
    const state = {
      comments: {
        commentsById: {
          'c1': { id: 'c1', targetType: 'epic', targetId: 'epic-1', status: 'open', isDeleted: false, authorId: 'u1', authorName: 'A', body: 'x', mentions: [], createdAt: '2026-01-01' },
          'c2': { id: 'c2', targetType: 'epic', targetId: 'epic-1', status: 'resolved', isDeleted: false, authorId: 'u1', authorName: 'A', body: 'y', mentions: [], createdAt: '2026-01-02' },
        },
        targetIndex: { 'epic:epic-1': ['c1', 'c2'] },
        notifications: [],
      },
    };
    render(
      <CommentCountBadge targetType="epic" targetId="epic-1" />,
      { initialState: state as never }
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not render for deleted comments', () => {
    const state = {
      comments: {
        commentsById: {
          'c1': { id: 'c1', targetType: 'task', targetId: 't-1', status: 'open', isDeleted: true, authorId: 'u1', authorName: 'A', body: '', mentions: [], createdAt: '2026-01-01' },
        },
        targetIndex: { 'task:t-1': ['c1'] },
        notifications: [],
      },
    };
    const { container } = render(
      <CommentCountBadge targetType="task" targetId="t-1" />,
      { initialState: state as never }
    );
    expect(container.innerHTML).toBe('');
  });
});
