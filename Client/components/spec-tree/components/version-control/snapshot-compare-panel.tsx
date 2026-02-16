import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VersionSnapshot } from '@/types/version-snapshot';
import type { SnapshotDiffResult } from '../../lib/utils/version-diff';
import VersionDiffView from './version-diff-view';

interface SnapshotComparePanelProps {
  snapshots: VersionSnapshot[];
  baseSnapshotId: string | null;
  compareSnapshotId: string | null;
  baseSnapshot: VersionSnapshot | null;
  compareSnapshot: VersionSnapshot | null;
  diff: SnapshotDiffResult | null;
  onBaseSnapshotChange: (value: string) => void;
  onCompareSnapshotChange: (value: string) => void;
}

const SnapshotComparePanel: React.FC<SnapshotComparePanelProps> = ({
  snapshots,
  baseSnapshotId,
  compareSnapshotId,
  baseSnapshot,
  compareSnapshot,
  diff,
  onBaseSnapshotChange,
  onCompareSnapshotChange,
}) => (
  <div className="space-y-3 rounded-lg border p-4">
    <p className="text-sm font-semibold text-foreground">Compare snapshots</p>
    <div className="grid gap-2 sm:grid-cols-2">
      <Select value={baseSnapshotId ?? ''} onValueChange={onBaseSnapshotChange}>
        <SelectTrigger>
          <SelectValue placeholder="Base" />
        </SelectTrigger>
        <SelectContent>
          {snapshots.map((snapshot) => (
            <SelectItem key={`base-${snapshot.id}`} value={snapshot.id}>
              {snapshot.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={compareSnapshotId ?? ''} onValueChange={onCompareSnapshotChange}>
        <SelectTrigger>
          <SelectValue placeholder="Compare" />
        </SelectTrigger>
        <SelectContent>
          {snapshots.map((snapshot) => (
            <SelectItem key={`compare-${snapshot.id}`} value={snapshot.id}>
              {snapshot.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {diff && baseSnapshot && compareSnapshot ? (
      <VersionDiffView
        baseSnapshot={baseSnapshot}
        compareSnapshot={compareSnapshot}
        diff={diff}
      />
    ) : (
      <p className="text-xs text-muted-foreground">
        Choose two different snapshots to view diff output.
      </p>
    )}
  </div>
);

export default SnapshotComparePanel;
