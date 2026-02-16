import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import CommentItem, { CommentNode } from './comment-item';
import type { MentionCandidate } from '@/types/comments';

const mentionCandidates: MentionCandidate[] = [
  { id: 'user-1', label: 'Jane Doe', value: 'jane' },
];

const noop = vi.fn(async () => undefined);

const makeComment = (overrides: Partial<CommentNode> = {}): CommentNode => ({
  id: 'comment-1',
  targetType: 'feature',
  targetId: 'feature-1',
  authorId: 'user-1',
  authorName: 'Jane Doe',
  body: 'Test comment',
  mentions: [],
  status: 'open',
  createdAt: '2026-01-01T00:00:00.000Z',
  replies: [],
  ...overrides,
});

describe('CommentItem - Enhanced Features', () => {
  describe('Collapse/Expand Replies', () => {
    it('shows reply count toggle when replies exist', () => {
      const reply = makeComment({ id: 'reply-1', parentId: 'comment-1', body: 'A reply' });
      render(
        <CommentItem
          comment={makeComment()}
          replies={[reply]}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      expect(screen.getByText('1 reply')).toBeInTheDocument();
    });

    it('uses plural for multiple replies', () => {
      const replies = [
        makeComment({ id: 'reply-1', parentId: 'comment-1', body: 'Reply 1' }),
        makeComment({ id: 'reply-2', parentId: 'comment-1', body: 'Reply 2' }),
      ];
      render(
        <CommentItem
          comment={makeComment()}
          replies={replies}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      expect(screen.getByText('2 replies')).toBeInTheDocument();
    });

    it('hides replies when collapsed', async () => {
      const reply = makeComment({ id: 'reply-1', parentId: 'comment-1', body: 'Hidden reply text' });
      const { user } = render(
        <CommentItem
          comment={makeComment()}
          replies={[reply]}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      expect(screen.getByText('Hidden reply text')).toBeInTheDocument();

      await user.click(screen.getByText('1 reply'));

      expect(screen.queryByText('Hidden reply text')).not.toBeInTheDocument();
    });

    it('does not show toggle when no replies', () => {
      render(
        <CommentItem
          comment={makeComment()}
          replies={[]}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      expect(screen.queryByText(/\d+ repl/i)).not.toBeInTheDocument();
    });
  });

  describe('Markdown Rendering', () => {
    it('renders bold text', () => {
      const comment = makeComment({ body: 'This is **bold** text' });
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      const strongEl = screen.getByText('bold');
      expect(strongEl.tagName).toBe('STRONG');
    });

    it('renders italic text', () => {
      const comment = makeComment({ body: 'This is *italic* text' });
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      const emEl = screen.getByText('italic');
      expect(emEl.tagName).toBe('EM');
    });

    it('renders inline code', () => {
      const comment = makeComment({ body: 'Use `console.log` here' });
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      const codeEl = screen.getByText('console.log');
      expect(codeEl.tagName).toBe('CODE');
    });

    it('renders deleted comment placeholder', () => {
      const comment = makeComment({ body: '' });
      render(
        <CommentItem
          comment={comment}
          replies={[]}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      expect(screen.getByText('Comment deleted')).toBeInTheDocument();
    });
  });

  describe('Nesting Depth', () => {
    it('renders Reply button at all depths', () => {
      render(
        <CommentItem
          comment={makeComment()}
          replies={[]}
          depth={3}
          mentionCandidates={mentionCandidates}
          currentUserId="user-1"
          onReply={noop}
          onResolve={noop}
          onReopen={noop}
          onDelete={noop}
        />
      );

      expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument();
    });
  });
});
