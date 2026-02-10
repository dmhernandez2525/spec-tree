import type { SowState } from '@/components/spec-tree/lib/types/work-items';

export type SowSnapshot = Omit<SowState, 'isLoading' | 'error'>;

export interface VersionSnapshot {
  id: string;
  appId: string;
  name: string;
  description?: string | null;
  snapshot: SowSnapshot;
  createdAt: string;
  createdById?: string | null;
  createdByName?: string | null;
}
