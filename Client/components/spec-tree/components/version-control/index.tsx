import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { History, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AppDispatch, RootState } from '@/lib/store';
import { setSow } from '@/lib/store/sow-slice';
import {
  selectCollaborationEnabled,
  selectCollaborationMode,
} from '@/lib/store/collaboration-slice';
import { logger } from '@/lib/logger';
import { strapiService } from '../../lib/api/strapi-service';
import { buildSowSnapshot } from '../../lib/utils/version-snapshots';
import type { VersionSnapshot } from '@/types/version-snapshot';

interface VersionControlProps {
  appId: string | null;
}

const VersionControl: React.FC<VersionControlProps> = ({ appId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((rootState: RootState) => rootState);
  const currentUser = useSelector((rootState: RootState) => rootState.user.user);
  const collaborationEnabled = useSelector(selectCollaborationEnabled);
  const collaborationMode = useSelector(selectCollaborationMode);
  const isReadOnly = collaborationEnabled && collaborationMode === 'read-only';

  const [open, setOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createdBy = useMemo(() => {
    const id = currentUser?.documentId || (currentUser?.id ? String(currentUser.id) : null);
    const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ');
    const nameValue = fullName || currentUser?.username || currentUser?.email || null;
    return { id, name: nameValue };
  }, [currentUser]);

  const loadSnapshots = useCallback(async () => {
    if (!appId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await strapiService.fetchVersionSnapshots(appId);
      setSnapshots(data);
    } catch (error) {
      logger.error('VersionControl', 'Failed to load snapshots', { error });
      setErrorMessage('Failed to load snapshots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    if (!open) return;
    void loadSnapshots();
  }, [open, loadSnapshots]);

  const handleCreateSnapshot = async () => {
    if (!appId || !name.trim() || isReadOnly) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const snapshot = buildSowSnapshot(state);
      const created = await strapiService.createVersionSnapshot({
        appId,
        name: name.trim(),
        description: description.trim() || undefined,
        snapshot,
        createdById: createdBy.id,
        createdByName: createdBy.name,
      });
      setSnapshots((prev) => [created, ...prev]);
      setName('');
      setDescription('');
    } catch (error) {
      logger.error('VersionControl', 'Failed to create snapshot', { error });
      setErrorMessage('Failed to create snapshot. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreSnapshot = (snapshot: VersionSnapshot) => {
    if (isReadOnly) return;
    dispatch(setSow({ sow: snapshot.snapshot }));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!appId}>
          <History className="h-4 w-4 mr-2" />
          Versions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version Control</DialogTitle>
          <DialogDescription>
            Capture snapshots of the current spec tree and restore them later.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 rounded-lg border border-border p-4">
          <h4 className="text-sm font-semibold text-foreground">Create Snapshot</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="snapshot-name">Name</Label>
              <Input
                id="snapshot-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Sprint 12 baseline"
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="snapshot-description">Description</Label>
              <Textarea
                id="snapshot-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Notes about the scope and milestone."
                className="min-h-[80px]"
                disabled={isReadOnly}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreateSnapshot}
                disabled={!name.trim() || isReadOnly || isLoading}
              >
                Create Snapshot
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Saved Snapshots
            </h4>
            {isLoading && (
              <span className="text-xs text-muted-foreground">Loading...</span>
            )}
          </div>
          <ScrollArea className="max-h-[320px]">
            <div className="space-y-3 pr-2">
              {snapshots.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No snapshots yet. Create one to capture the current state.
                </div>
              ) : (
                snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {snapshot.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(snapshot.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                        {snapshot.description ? (
                          <p className="text-xs text-muted-foreground">
                            {snapshot.description}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreSnapshot(snapshot)}
                        disabled={isReadOnly}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionControl;
