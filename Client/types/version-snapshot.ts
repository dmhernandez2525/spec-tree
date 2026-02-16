import type { SowState } from '@/components/spec-tree/lib/types/work-items';

export type SowSnapshot = Omit<SowState, 'isLoading' | 'error'>;
export type VersionSnapshotSourceEvent =
  | 'manual'
  | 'batch-generation'
  | 'bulk-move'
  | 'import'
  | 'restore'
  | 'branch';

export const isVersionSnapshotSourceEvent = (
  value: unknown
): value is VersionSnapshotSourceEvent => {
  if (typeof value !== 'string') {
    return false;
  }

  switch (value) {
    case 'manual':
    case 'batch-generation':
    case 'bulk-move':
    case 'import':
    case 'restore':
    case 'branch':
      return true;
    default:
      return false;
  }
};

export interface VersionSnapshot {
  id: string;
  appId: string;
  name: string;
  description?: string | null;
  snapshot: SowSnapshot;
  createdAt: string;
  createdById?: string | null;
  createdByName?: string | null;
  tags: string[];
  isMilestone: boolean;
  milestoneTag?: string | null;
  sourceEvent: VersionSnapshotSourceEvent;
  branchName?: string | null;
  parentSnapshotId?: string | null;
}
