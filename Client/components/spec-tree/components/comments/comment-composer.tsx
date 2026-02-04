import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { MentionCandidate } from '@/types/comments';
import {
  extractMentions,
  findMentionMatch,
  replaceMentionText,
} from '../../lib/utils/mention-utils';

interface CommentComposerProps {
  onSubmit: (body: string, mentions: string[]) => Promise<void> | void;
  onCancel?: () => void;
  mentionCandidates: MentionCandidate[];
  placeholder?: string;
  isReadOnly?: boolean;
  className?: string;
}

const CommentComposer: React.FC<CommentComposerProps> = ({
  onSubmit,
  onCancel,
  mentionCandidates,
  placeholder = 'Add a comment...',
  isReadOnly = false,
  className,
}) => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionMatch, setMentionMatch] = useState<ReturnType<typeof findMentionMatch> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const suggestions = useMemo(() => {
    if (!mentionQuery) return [];
    const lower = mentionQuery.toLowerCase();
    return mentionCandidates.filter(
      (candidate) =>
        candidate.label.toLowerCase().includes(lower) ||
        candidate.value.toLowerCase().includes(lower)
    );
  }, [mentionCandidates, mentionQuery]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setValue(text);

    const cursorPosition = event.target.selectionStart || text.length;
    const match = findMentionMatch(text, cursorPosition);
    setMentionMatch(match);
    setMentionQuery(match?.query || '');
  };

  const handleSelectCandidate = (candidate: MentionCandidate) => {
    if (!mentionMatch) return;
    const { updatedText, newCursorPosition } = replaceMentionText(
      value,
      mentionMatch,
      candidate.value
    );
    setValue(updatedText);
    setMentionMatch(null);
    setMentionQuery('');

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    });
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      const mentions = extractMentions(trimmed, mentionCandidates);
      await onSubmit(trimmed, mentions);
      setValue('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="min-h-[100px]"
          disabled={isReadOnly || isSubmitting}
          readOnly={isReadOnly}
        />
        {mentionMatch && suggestions.length > 0 && (
          <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-lg border border-border bg-background shadow-md">
            <div className="max-h-48 overflow-y-auto py-1">
              {suggestions.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => handleSelectCandidate(candidate)}
                >
                  <span className="font-medium text-foreground">{candidate.label}</span>
                  <span className="text-xs text-muted-foreground">@{candidate.value}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSubmit} disabled={isReadOnly || isSubmitting || !value.trim()}>
          Post Comment
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isReadOnly || isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommentComposer;
