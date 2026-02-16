import React, { useState } from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SnapshotCreateForm from './snapshot-create-form';
import SnapshotComparePanel from './snapshot-compare-panel';
import VersionSnapshotTimeline from './version-snapshot-timeline';
import { useVersionControl } from './use-version-control';

interface VersionControlProps {
  appId: string | null;
}

const VersionControlPanel: React.FC<VersionControlProps> = ({ appId }) => {
  const [open, setOpen] = useState(false);
  const {
    snapshots,
    isLoading,
    errorMessage,
    isReadOnly,
    name,
    description,
    tags,
    isMilestone,
    milestoneTag,
    baseSnapshotId,
    compareSnapshotId,
    restoreTarget,
    branchSourceId,
    branchName,
    baseSnapshot,
    compareSnapshot,
    diff,
    setName,
    setDescription,
    setTags,
    setIsMilestone,
    setMilestoneTag,
    setBaseSnapshotId,
    setCompareSnapshotId,
    setRestoreSnapshotId,
    setBranchSourceId,
    setBranchName,
    handleCreateManualSnapshot,
    handleRestoreConfirm,
    handleExportSnapshot,
    handleCreateBranch,
  } = useVersionControl({
    appId,
    isOpen: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!appId}>
          <History className="h-4 w-4 mr-2" />
          Versions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Version Control</DialogTitle>
          <DialogDescription>
            Snapshots, compare mode, restore, and branching.
          </DialogDescription>
        </DialogHeader>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <SnapshotCreateForm
            name={name}
            description={description}
            tags={tags}
            milestoneTag={milestoneTag}
            isMilestone={isMilestone}
            isReadOnly={isReadOnly}
            isLoading={isLoading}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onTagsChange={setTags}
            onMilestoneTagChange={setMilestoneTag}
            onMilestoneToggle={setIsMilestone}
            onSubmit={handleCreateManualSnapshot}
          />

          <SnapshotComparePanel
            snapshots={snapshots}
            baseSnapshotId={baseSnapshotId}
            compareSnapshotId={compareSnapshotId}
            baseSnapshot={baseSnapshot}
            compareSnapshot={compareSnapshot}
            diff={diff}
            onBaseSnapshotChange={setBaseSnapshotId}
            onCompareSnapshotChange={setCompareSnapshotId}
          />
        </div>

        <VersionSnapshotTimeline
          snapshots={snapshots}
          isLoading={isLoading}
          isReadOnly={isReadOnly}
          branchSourceId={branchSourceId}
          branchName={branchName}
          onBranchNameChange={setBranchName}
          onSelectBranchSource={setBranchSourceId}
          onCreateBranch={handleCreateBranch}
          onRestore={setRestoreSnapshotId}
          onExport={handleExportSnapshot}
        />
      </DialogContent>

      <AlertDialog
        open={Boolean(restoreTarget)}
        onOpenChange={(value) => {
          if (!value) {
            setRestoreSnapshotId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore snapshot?</AlertDialogTitle>
            <AlertDialogDescription>
              This restores &quot;{restoreTarget?.name || ''}&quot; and first
              creates a safety backup of your current state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default VersionControlPanel;
