import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/lib/store';
import { setSow } from '@/lib/store/sow-slice';
import {
  selectCollaborationEnabled,
  selectCollaborationMode,
} from '@/lib/store/collaboration-slice';
import { logger } from '@/lib/logger';
import type { VersionSnapshot } from '@/types/version-snapshot';
import { strapiService } from '../../lib/api/strapi-service';
import { buildSnapshotDiff } from '../../lib/utils/version-diff';
import { buildSowSnapshot } from '../../lib/utils/version-snapshots';
import { subscribeAutoSnapshotEvent } from '../../lib/utils/version-snapshot-events';
import type { AutoSnapshotEventType } from '../../lib/utils/version-snapshot-events';
import type {
  CreateSnapshotInput,
  UseVersionControlParams,
  UseVersionControlResult,
} from './version-control.types';

const AUTO_SNAPSHOT_COOLDOWN_MS = 8000;

const parseTags = (input: string): string[] =>
  input
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

export const useVersionControl = ({
  appId,
  isOpen,
}: UseVersionControlParams): UseVersionControlResult => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((rootState: RootState) => rootState);
  const currentUser = useSelector((rootState: RootState) => rootState.user.user);
  const collaborationEnabled = useSelector(selectCollaborationEnabled);
  const collaborationMode = useSelector(selectCollaborationMode);
  const isReadOnly = collaborationEnabled && collaborationMode === 'read-only';

  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneTag, setMilestoneTag] = useState('');
  const [baseSnapshotId, setBaseSnapshotId] = useState<string | null>(null);
  const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(null);
  const [restoreSnapshotId, setRestoreSnapshotId] = useState<string | null>(null);
  const [branchSourceId, setBranchSourceId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState('');

  const autoSnapshotByType = useRef<Record<AutoSnapshotEventType, number>>({
    'batch-generation': 0,
    'bulk-move': 0,
    import: 0,
  });

  const createdBy = useMemo(() => {
    const id = currentUser?.documentId || (currentUser?.id ? String(currentUser.id) : null);
    const fullName = [currentUser?.firstName, currentUser?.lastName]
      .filter(Boolean)
      .join(' ');
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
      logger.error('VersionControlPanel', 'Failed to load snapshots', { error });
      setErrorMessage('Failed to load snapshots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [appId]);

  const createSnapshot = useCallback(
    async (input: CreateSnapshotInput): Promise<VersionSnapshot | null> => {
      if (!appId || isReadOnly) return null;

      try {
        const snapshot = input.snapshotOverride || buildSowSnapshot(state);
        const created = await strapiService.createVersionSnapshot({
          appId,
          name: input.name,
          description: input.description,
          snapshot,
          createdById: createdBy.id,
          createdByName: createdBy.name,
          sourceEvent: input.sourceEvent,
          tags: input.tags,
          isMilestone: input.isMilestone,
          milestoneTag: input.milestoneTag,
          branchName: input.branchName,
          parentSnapshotId: input.parentSnapshotId,
        });
        setSnapshots((previous) => [created, ...previous]);
        return created;
      } catch (error) {
        logger.error('VersionControlPanel', 'Failed to create snapshot', { error });
        setErrorMessage('Failed to create snapshot. Please try again.');
        return null;
      }
    },
    [appId, createdBy.id, createdBy.name, isReadOnly, state]
  );

  useEffect(() => {
    if (!isOpen) return;
    void loadSnapshots();
  }, [isOpen, loadSnapshots]);

  useEffect(() => {
    if (snapshots.length === 0) {
      setBaseSnapshotId(null);
      setCompareSnapshotId(null);
      return;
    }

    if (!baseSnapshotId || !snapshots.some((snapshot) => snapshot.id === baseSnapshotId)) {
      setBaseSnapshotId(snapshots[0].id);
    }
    if (!compareSnapshotId || !snapshots.some((snapshot) => snapshot.id === compareSnapshotId)) {
      setCompareSnapshotId((snapshots[1] || snapshots[0]).id);
    }
  }, [baseSnapshotId, compareSnapshotId, snapshots]);

  useEffect(() => {
    if (!appId || isReadOnly) return;

    return subscribeAutoSnapshotEvent((detail) => {
      const lastTimestamp = autoSnapshotByType.current[detail.eventType];
      const now = Date.now();
      if (now - lastTimestamp < AUTO_SNAPSHOT_COOLDOWN_MS) {
        return;
      }

      autoSnapshotByType.current[detail.eventType] = now;
      void createSnapshot({
        name: `Auto: ${detail.label}`,
        description: `Automatic snapshot captured from ${detail.eventType}.`,
        sourceEvent: detail.eventType,
        tags: ['auto', detail.eventType],
      });
    });
  }, [appId, createSnapshot, isReadOnly]);

  const restoreTarget = useMemo(
    () => snapshots.find((snapshot) => snapshot.id === restoreSnapshotId) || null,
    [restoreSnapshotId, snapshots]
  );
  const baseSnapshot = useMemo(
    () => snapshots.find((snapshot) => snapshot.id === baseSnapshotId) || null,
    [baseSnapshotId, snapshots]
  );
  const compareSnapshot = useMemo(
    () => snapshots.find((snapshot) => snapshot.id === compareSnapshotId) || null,
    [compareSnapshotId, snapshots]
  );
  const diff = useMemo(() => {
    if (!baseSnapshot || !compareSnapshot || baseSnapshot.id === compareSnapshot.id) {
      return null;
    }
    return buildSnapshotDiff(baseSnapshot.snapshot, compareSnapshot.snapshot);
  }, [baseSnapshot, compareSnapshot]);

  const handleCreateManualSnapshot = useCallback(async (): Promise<void> => {
    if (!name.trim()) return;
    setIsLoading(true);
    const created = await createSnapshot({
      name: name.trim(),
      description: description.trim() || undefined,
      sourceEvent: 'manual',
      tags: parseTags(tags),
      isMilestone,
      milestoneTag: milestoneTag.trim() || null,
    });
    setIsLoading(false);

    if (!created) return;
    setName('');
    setDescription('');
    setTags('');
    setIsMilestone(false);
    setMilestoneTag('');
  }, [createSnapshot, description, isMilestone, milestoneTag, name, tags]);

  const handleRestoreConfirm = useCallback(async (): Promise<void> => {
    if (!restoreTarget || isReadOnly) return;
    setIsLoading(true);
    await createSnapshot({
      name: `Restore backup: ${new Date().toISOString()}`,
      description: `Automatic safety snapshot before restoring "${restoreTarget.name}".`,
      sourceEvent: 'restore',
      tags: ['restore-backup'],
    });
    dispatch(setSow({ sow: restoreTarget.snapshot }));
    setRestoreSnapshotId(null);
    setIsLoading(false);
  }, [createSnapshot, dispatch, isReadOnly, restoreTarget]);

  const handleExportSnapshot = useCallback((snapshot: VersionSnapshot): void => {
    const blob = new Blob([JSON.stringify(snapshot.snapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spec-tree-snapshot-${snapshot.name
      .replace(/\s+/g, '-')
      .toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, []);

  const handleCreateBranch = useCallback(async (): Promise<void> => {
    if (!branchSourceId || !branchName.trim()) return;
    const source = snapshots.find((snapshot) => snapshot.id === branchSourceId);
    if (!source) return;
    setIsLoading(true);
    await createSnapshot({
      name: `${source.name} :: ${branchName.trim()}`,
      description: `Branch created from snapshot "${source.name}".`,
      sourceEvent: 'branch',
      tags: source.tags,
      branchName: branchName.trim(),
      parentSnapshotId: source.id,
      snapshotOverride: source.snapshot,
    });
    setIsLoading(false);
    setBranchSourceId(null);
    setBranchName('');
  }, [branchName, branchSourceId, createSnapshot, snapshots]);

  return {
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
  };
};
