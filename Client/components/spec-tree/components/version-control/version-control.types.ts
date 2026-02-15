import type {
  SowSnapshot,
  VersionSnapshot,
  VersionSnapshotSourceEvent,
} from '@/types/version-snapshot';
import type { SnapshotDiffResult } from '../../lib/utils/version-diff';

export interface CreateSnapshotInput {
  name: string;
  description?: string;
  sourceEvent: VersionSnapshotSourceEvent;
  tags?: string[];
  isMilestone?: boolean;
  milestoneTag?: string | null;
  branchName?: string | null;
  parentSnapshotId?: string | null;
  snapshotOverride?: SowSnapshot;
}

export interface UseVersionControlParams {
  appId: string | null;
  isOpen: boolean;
}

export interface UseVersionControlResult {
  snapshots: VersionSnapshot[];
  isLoading: boolean;
  errorMessage: string | null;
  isReadOnly: boolean;
  name: string;
  description: string;
  tags: string;
  isMilestone: boolean;
  milestoneTag: string;
  baseSnapshotId: string | null;
  compareSnapshotId: string | null;
  restoreTarget: VersionSnapshot | null;
  branchSourceId: string | null;
  branchName: string;
  baseSnapshot: VersionSnapshot | null;
  compareSnapshot: VersionSnapshot | null;
  diff: SnapshotDiffResult | null;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setTags: (value: string) => void;
  setIsMilestone: (value: boolean) => void;
  setMilestoneTag: (value: string) => void;
  setBaseSnapshotId: (value: string) => void;
  setCompareSnapshotId: (value: string) => void;
  setRestoreSnapshotId: (value: string | null) => void;
  setBranchSourceId: (value: string | null) => void;
  setBranchName: (value: string) => void;
  handleCreateManualSnapshot: () => Promise<void>;
  handleRestoreConfirm: () => Promise<void>;
  handleExportSnapshot: (snapshot: VersionSnapshot) => void;
  handleCreateBranch: () => Promise<void>;
}
