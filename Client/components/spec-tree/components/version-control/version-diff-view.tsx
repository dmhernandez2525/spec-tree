import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { VersionSnapshot } from '@/types/version-snapshot';
import type {
  SnapshotCollectionDiff,
  SnapshotDiffResult,
} from '../../lib/utils/version-diff';

interface VersionDiffViewProps {
  baseSnapshot: VersionSnapshot;
  compareSnapshot: VersionSnapshot;
  diff: SnapshotDiffResult;
}

const COLLECTION_LABELS: Record<keyof SnapshotDiffResult, string> = {
  epics: 'Epics',
  features: 'Features',
  userStories: 'User Stories',
  tasks: 'Tasks',
  totalChanges: 'Total Changes',
};

const renderEntries = (
  entries: SnapshotCollectionDiff['added'],
  fallback: string
): React.ReactNode => {
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">{fallback}</p>;
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-md border bg-background p-2">
          <p className="text-xs font-medium text-foreground">{entry.title}</p>
          {entry.changedFields.length > 0 ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Fields: {entry.changedFields.join(', ')}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const VersionDiffView: React.FC<VersionDiffViewProps> = ({
  baseSnapshot,
  compareSnapshot,
  diff,
}) => {
  const collectionKeys: Array<Exclude<keyof SnapshotDiffResult, 'totalChanges'>> = [
    'epics',
    'features',
    'userStories',
    'tasks',
  ];

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Comparison Diff</p>
        <Badge variant="secondary">{diff.totalChanges} total changes</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Base: <span className="font-medium text-foreground">{baseSnapshot.name}</span> | Compare:{' '}
        <span className="font-medium text-foreground">{compareSnapshot.name}</span>
      </p>

      <Separator />

      {collectionKeys.map((key) => {
        const collectionDiff = diff[key];
        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {COLLECTION_LABELS[key]}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Base: {collectionDiff.totals.base}</span>
                <span>Compare: {collectionDiff.totals.compare}</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-emerald-600">
                  Added ({collectionDiff.totals.added})
                </p>
                {renderEntries(
                  collectionDiff.added,
                  `No ${COLLECTION_LABELS[key].toLowerCase()} added.`
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-rose-600">
                  Removed ({collectionDiff.totals.removed})
                </p>
                {renderEntries(
                  collectionDiff.removed,
                  `No ${COLLECTION_LABELS[key].toLowerCase()} removed.`
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-amber-600">
                  Modified ({collectionDiff.totals.modified})
                </p>
                {renderEntries(
                  collectionDiff.modified,
                  `No ${COLLECTION_LABELS[key].toLowerCase()} modified.`
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VersionDiffView;
