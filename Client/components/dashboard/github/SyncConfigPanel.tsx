'use client';

/**
 * Sync configuration panel.
 * Lists active sync configs with status badges, last-sync timestamps,
 * and per-config actions (trigger sync, edit, delete).
 */

import React, { useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Pencil,
  Trash2,
  Plus,
  FolderSync,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import {
  fetchSyncConfigs,
  triggerSync,
  deleteSyncConfig,
  updateSyncConfig,
} from '@/lib/store/github-slice';
import type { GitHubSyncConfig, GitHubSyncStatus } from '@/types/github';

// ---------------------------------------------------------------------------
// Status Helpers
// ---------------------------------------------------------------------------

const syncStatusStyles: Record<GitHubSyncStatus, string> = {
  synced: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  conflict: 'bg-red-100 text-red-700',
  error: 'bg-red-100 text-red-700',
};

const syncStatusLabels: Record<GitHubSyncStatus, string> = {
  synced: 'Synced',
  pending: 'Pending',
  conflict: 'Conflict',
  error: 'Error',
};

function formatSyncDate(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Config Row
// ---------------------------------------------------------------------------

interface ConfigRowProps {
  config: GitHubSyncConfig;
  onTriggerSync: (id: string) => void;
  onToggleAutoSync: (config: GitHubSyncConfig) => void;
  onEdit: (config: GitHubSyncConfig) => void;
  onDelete: (id: string) => void;
  isSyncing: boolean;
}

const ConfigRow: React.FC<ConfigRowProps> = ({
  config,
  onTriggerSync,
  onToggleAutoSync,
  onEdit,
  onDelete,
  isSyncing,
}) => (
  <Card>
    <CardHeader className="p-3 pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderSync className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-sm font-medium">{config.repoFullName}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {config.syncPath} / {config.branch}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={syncStatusStyles[config.syncStatus]}>
            {syncStatusLabels[config.syncStatus]}
          </Badge>
          <Switch
            checked={config.autoSync}
            onCheckedChange={() => onToggleAutoSync(config)}
            aria-label={`Toggle auto-sync for ${config.repoFullName}`}
          />
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Last sync: {formatSyncDate(config.lastSyncAt)}</span>
          {config.pendingChanges > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {config.pendingChanges} pending
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTriggerSync(config.id)}
            disabled={isSyncing}
            title="Trigger sync"
          >
            {isSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(config)}
            title="Edit config"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(config.id)}
            title="Delete config"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface SyncConfigPanelProps {
  onCreateNew?: () => void;
  onEdit?: (config: GitHubSyncConfig) => void;
}

const SyncConfigPanel: React.FC<SyncConfigPanelProps> = ({ onCreateNew, onEdit }) => {
  const dispatch = useAppDispatch();
  const syncConfigs = useAppSelector((state) => state.github.syncConfigs);
  const isLoading = useAppSelector((state) => state.github.isLoading);
  const error = useAppSelector((state) => state.github.error);
  const authStatus = useAppSelector((state) => state.github.authStatus);

  const [syncingId, setSyncingId] = React.useState<string | null>(null);

  useEffect(() => {
    if (authStatus === 'connected') {
      void dispatch(fetchSyncConfigs());
    }
  }, [dispatch, authStatus]);

  const handleTriggerSync = useCallback(
    async (configId: string) => {
      setSyncingId(configId);
      try {
        await dispatch(triggerSync(configId)).unwrap();
      } finally {
        setSyncingId(null);
      }
    },
    [dispatch],
  );

  const handleToggleAutoSync = useCallback(
    (config: GitHubSyncConfig) => {
      void dispatch(
        updateSyncConfig({ id: config.id, autoSync: !config.autoSync }),
      );
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (configId: string) => {
      void dispatch(deleteSyncConfig(configId));
    },
    [dispatch],
  );

  const handleEdit = useCallback(
    (config: GitHubSyncConfig) => {
      onEdit?.(config);
    },
    [onEdit],
  );

  if (authStatus !== 'connected') {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Connect your GitHub account to configure repository syncing.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sync Configurations</h3>
          <p className="text-xs text-muted-foreground">
            Manage how spec trees sync with GitHub repositories.
          </p>
        </div>
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="mr-1 h-4 w-4" /> New Sync Config
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading sync configurations...
        </div>
      ) : syncConfigs.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No sync configurations yet. Create one to start syncing spec trees with GitHub.
        </div>
      ) : (
        <div className="space-y-2">
          {syncConfigs.map((config) => (
            <ConfigRow
              key={config.id}
              config={config}
              onTriggerSync={handleTriggerSync}
              onToggleAutoSync={handleToggleAutoSync}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isSyncing={syncingId === config.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SyncConfigPanel;
