import type { MentionCandidate } from '@/types/comments';

export interface MentionMatch {
  query: string;
  start: number;
  end: number;
}

export const findMentionMatch = (
  text: string,
  cursorPosition: number
): MentionMatch | null => {
  if (cursorPosition < 0 || cursorPosition > text.length) {
    return null;
  }

  const beforeCursor = text.slice(0, cursorPosition);
  const atIndex = beforeCursor.lastIndexOf('@');
  if (atIndex === -1) return null;

  const charBefore = atIndex > 0 ? beforeCursor[atIndex - 1] : '';
  if (charBefore && !/\s/.test(charBefore)) {
    return null;
  }

  const query = beforeCursor.slice(atIndex + 1);
  if (query.includes(' ') || query.includes('\n')) {
    return null;
  }

  return { query, start: atIndex, end: cursorPosition };
};

export const replaceMentionText = (
  text: string,
  match: MentionMatch,
  value: string
): { updatedText: string; newCursorPosition: number } => {
  const prefix = text.slice(0, match.start);
  const suffix = text.slice(match.end);
  const mentionText = `@${value}`;
  const updatedText = `${prefix}${mentionText} ${suffix}`;
  const newCursorPosition = prefix.length + mentionText.length + 1;
  return { updatedText, newCursorPosition };
};

export const extractMentions = (
  text: string,
  candidates: MentionCandidate[]
): string[] => {
  const values = new Map(
    candidates.map((candidate) => [
      candidate.value.toLowerCase(),
      candidate.id,
    ])
  );

  const matches: string[] = text.match(/@([a-zA-Z0-9._-]+)/g) || [];
  const ids = new Set<string>();

  matches.forEach((match) => {
    const value = match.slice(1).toLowerCase();
    const candidateId = values.get(value);
    if (candidateId) {
      ids.add(candidateId);
    }
  });

  return Array.from(ids);
};

export const toMentionValue = (label: string) =>
  label.replace(/\s+/g, '');
