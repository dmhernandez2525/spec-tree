import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Download, GitBranch, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { VersionSnapshot } from '@/types/version-snapshot';

interface VersionSnapshotTimelineProps {
  snapshots: VersionSnapshot[];
  isLoading: boolean;
  isReadOnly: boolean;
  branchSourceId: string | null;
  branchName: string;
  onBranchNameChange: (value: string) => void;
  onSelectBranchSource: (snapshotId: string | null) => void;
  onCreateBranch: () => void;
  onRestore: (snapshotId: string) => void;
  onExport: (snapshot: VersionSnapshot) => void;
}

const VersionSnapshotTimeline: React.FC<VersionSnapshotTimelineProps> = ({
  snapshots,
  isLoading,
  isReadOnly,
  branchSourceId,
  branchName,
  onBranchNameChange,
  onSelectBranchSource,
  onCreateBranch,
  onRestore,
  onExport,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-foreground">Timeline</p>
      {isLoading ? (
        <span className="text-xs text-muted-foreground">Working...</span>
      ) : null}
    </div>
    <ScrollArea className="max-h-[300px]">
      <div className="space-y-3 pr-2">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            className="rounded-md border-l-4 border border-border border-l-primary p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{snapshot.name}</p>
              {snapshot.isMilestone ? <Badge variant="default">Milestone</Badge> : null}
              {snapshot.milestoneTag ? (
                <Badge variant="secondary">{snapshot.milestoneTag}</Badge>
              ) : null}
              <Badge variant="outline">{snapshot.sourceEvent}</Badge>
              {snapshot.branchName ? (
                <Badge variant="outline">Branch: {snapshot.branchName}</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(snapshot.createdAt), {
                addSuffix: true,
              })}
            </p>
            {snapshot.description ? (
              <p className="mt-1 text-xs text-muted-foreground">{snapshot.description}</p>
            ) : null}
            {snapshot.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {snapshot.tags.map((tag) => (
                  <Badge key={`${snapshot.id}-${tag}`} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRestore(snapshot.id)}
                disabled={isReadOnly}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restore
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport(snapshot)}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectBranchSource(snapshot.id)}
                disabled={isReadOnly}
              >
                <GitBranch className="h-4 w-4 mr-1" />
                Branch
              </Button>
            </div>

            {branchSourceId === snapshot.id ? (
              <div className="mt-2 flex gap-2">
                <Input
                  value={branchName}
                  onChange={(event) => onBranchNameChange(event.target.value)}
                  placeholder="Branch name"
                />
                <Button
                  size="sm"
                  onClick={onCreateBranch}
                  disabled={!branchName.trim() || isLoading}
                >
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelectBranchSource(null);
                    onBranchNameChange('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        {snapshots.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No snapshots yet.
          </div>
        ) : null}
      </div>
    </ScrollArea>
  </div>
);

export default VersionSnapshotTimeline;
