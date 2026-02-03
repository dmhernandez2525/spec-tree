import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import CommentComposer from './comment-composer';
import type { MentionCandidate } from '@/types/comments';

const mentionCandidates: MentionCandidate[] = [
  {
    id: 'user-1',
    label: 'Jane Doe',
    value: 'jane',
  },
];

describe('CommentComposer', () => {
  it('inserts mention and submits with mention ids', async () => {
    const handleSubmit = vi.fn();
    const { user } = render(
      <CommentComposer onSubmit={handleSubmit} mentionCandidates={mentionCandidates} />
    );

    const textarea = screen.getByPlaceholderText('Add a comment...');

    await user.type(textarea, '@ja');
    const suggestion = screen.getByRole('button', { name: /Jane Doe/i });
    await user.click(suggestion);
    await user.type(textarea, 'hello');
    await user.click(screen.getByRole('button', { name: /post comment/i }));

    expect(handleSubmit).toHaveBeenCalledWith('@jane hello', ['user-1']);
  });
});
