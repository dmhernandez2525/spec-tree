import type { MentionCandidate } from '@/types/comments';
import { toMentionValue } from '../utils/mention-utils';

export const defaultMentionCandidates: MentionCandidate[] = [
  {
    id: 'user-101',
    label: 'Avery Kim',
    value: toMentionValue('Avery Kim'),
    email: 'avery@example.com',
  },
  {
    id: 'user-102',
    label: 'Jordan Lee',
    value: toMentionValue('Jordan Lee'),
    email: 'jordan@example.com',
  },
  {
    id: 'user-103',
    label: 'Riley Patel',
    value: toMentionValue('Riley Patel'),
    email: 'riley@example.com',
  },
];
