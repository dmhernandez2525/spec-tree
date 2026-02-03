import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/src/test/test-utils';
import CommentsPanel from './comments-panel';
import type { Comment } from '@/types/comments';
import type { UserAttributes } from '@/types/user';

vi.mock('../../lib/api/strapi-service', () => ({
  strapiService: {
    fetchCommentsForTarget: vi.fn(),
    fetchCommentNotificationsForUser: vi.fn(),
    markCommentNotificationsRead: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { strapiService } from '../../lib/api/strapi-service';

const mockUser = {
  id: 1,
  documentId: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  email: 'test@example.com',
} as unknown as UserAttributes;

const baseState = {
  user: {
    user: mockUser,
    token: null,
  },
  organization: {
    currentOrganization: null,
    members: [],
    invites: [],
    subscription: null,
    isLoading: false,
    error: null,
  },
  comments: {
    commentsById: {},
    targetIndex: {},
    notifications: [],
  },
};

describe('CommentsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders comments', async () => {
    const comments: Comment[] = [
      {
        id: 'comment-1',
        targetType: 'feature',
        targetId: 'feature-1',
        authorId: 'user-1',
        authorName: 'Test User',
        body: 'Review this feature',
        mentions: [],
        status: 'open',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'comment-2',
        targetType: 'feature',
        targetId: 'feature-1',
        parentId: 'comment-1',
        authorId: 'user-2',
        authorName: 'Second User',
        body: 'Replying here',
        mentions: [],
        status: 'open',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ];

    vi.mocked(strapiService.fetchCommentsForTarget).mockResolvedValueOnce(comments);
    vi.mocked(strapiService.fetchCommentNotificationsForUser).mockResolvedValueOnce([]);

    render(
      <CommentsPanel targetType="feature" targetId="feature-1" targetTitle="Feature One" />,
      {
        initialState: baseState,
      }
    );

    await waitFor(() =>
      expect(strapiService.fetchCommentsForTarget).toHaveBeenCalledWith('feature', 'feature-1')
    );
    await waitFor(() =>
      expect(strapiService.fetchCommentNotificationsForUser).toHaveBeenCalledWith('user-1')
    );

    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText(/2 open/)).toBeInTheDocument();
    expect(screen.getByText(/0 resolved/)).toBeInTheDocument();
    expect(screen.getByText('Review this feature')).toBeInTheDocument();
    expect(screen.getByText('Replying here')).toBeInTheDocument();
  });

  it('creates a comment from the composer', async () => {
    const savedComment: Comment = {
      id: 'comment-3',
      targetType: 'feature',
      targetId: 'feature-1',
      authorId: 'user-1',
      authorName: 'Test User',
      body: 'New comment',
      mentions: [],
      status: 'open',
      createdAt: '2026-01-03T00:00:00.000Z',
      updatedAt: '2026-01-03T00:00:00.000Z',
    };

    vi.mocked(strapiService.fetchCommentsForTarget).mockResolvedValueOnce([]);
    vi.mocked(strapiService.fetchCommentNotificationsForUser).mockResolvedValueOnce([]);
    vi.mocked(strapiService.createComment).mockResolvedValueOnce(savedComment);

    const { user } = render(
      <CommentsPanel targetType="feature" targetId="feature-1" targetTitle="Feature One" />,
      {
        initialState: baseState,
      }
    );

    const textarea = await screen.findByPlaceholderText('Comment on Feature One...');
    await user.type(textarea, 'New comment');
    await user.click(screen.getByRole('button', { name: /post comment/i }));

    await waitFor(() => expect(strapiService.createComment).toHaveBeenCalled());

    expect(strapiService.createComment).toHaveBeenCalledWith(
      expect.objectContaining({
        targetType: 'feature',
        targetId: 'feature-1',
        body: 'New comment',
        mentions: [],
      })
    );

    expect(screen.getByText('New comment')).toBeInTheDocument();
  });
});
