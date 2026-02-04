import { describe, it, expect } from 'vitest';
import {
  findMentionMatch,
  replaceMentionText,
  extractMentions,
  toMentionValue,
} from './mention-utils';
import type { MentionCandidate } from '@/types/comments';

describe('mention-utils', () => {
  it('finds mention match near cursor', () => {
    const match = findMentionMatch('Hello @av', 9);
    expect(match?.query).toBe('av');
  });

  it('replaces mention text with value', () => {
    const match = findMentionMatch('Hello @av', 9);
    if (!match) throw new Error('Expected match');
    const result = replaceMentionText('Hello @av', match, 'avery');
    expect(result.updatedText).toBe('Hello @avery ');
  });

  it('extracts mentions from text', () => {
    const candidates: MentionCandidate[] = [
      { id: 'user-1', label: 'Avery Kim', value: 'AveryKim' },
      { id: 'user-2', label: 'Jordan Lee', value: 'JordanLee' },
    ];

    const mentions = extractMentions('Hey @AveryKim and @JordanLee', candidates);
    expect(mentions).toEqual(['user-1', 'user-2']);
  });

  it('creates mention value from label', () => {
    expect(toMentionValue('Avery Kim')).toBe('AveryKim');
  });
});
