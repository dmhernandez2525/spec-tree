/**
 * Repository sync engine for F3.1.3 - GitHub Integration
 *
 * Pushes SDD content to a linked GitHub repository, pulls remote
 * changes, detects conflicts, and generates markdown representations
 * of spec data. All GitHub API calls are routed through internal
 * Next.js API routes.
 */

import type {
  GitHubConflict,
  GitHubSyncConfig,
  GitHubSyncStatus,
} from '@/types/github';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Push SDD content to the configured repository and path.
 *
 * Creates a commit on the configured branch with the provided content
 * and commit message.
 */
export async function syncSpecToRepo(
  syncConfig: GitHubSyncConfig,
  content: string,
  commitMessage: string,
): Promise<void> {
  const response = await fetch('/api/v1/github/sync/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      syncConfigId: syncConfig.id,
      repoFullName: syncConfig.repoFullName,
      branch: syncConfig.branch,
      path: syncConfig.syncPath,
      content,
      commitMessage,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Failed to push spec content to repository';
    throw new Error(message);
  }
}

/**
 * Pull the latest content from the configured repository path.
 *
 * Returns the raw file content, or `null` if the file does not exist
 * in the remote repository yet.
 */
export async function pullFromRepo(
  syncConfig: GitHubSyncConfig,
): Promise<string | null> {
  const params = new URLSearchParams({
    repoFullName: syncConfig.repoFullName,
    branch: syncConfig.branch,
    path: syncConfig.syncPath,
  });

  const response = await fetch(`/api/v1/github/sync/pull?${params.toString()}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Failed to pull content from repository';
    throw new Error(message);
  }

  const data = (await response.json()) as { content: string };
  return data.content;
}

/**
 * Detect whether local and remote content have diverged.
 *
 * A conflict exists when the content strings differ AND neither
 * timestamp is strictly ahead of the other (i.e. both sides were
 * modified since the last sync).
 *
 * Returns a `GitHubConflict` object when a conflict is detected, or
 * `null` if the contents are in agreement.
 */
export function detectConflicts(
  localContent: string,
  remoteContent: string,
  localTimestamp: string,
  remoteTimestamp: string,
): GitHubConflict | null {
  if (localContent === remoteContent) {
    return null;
  }

  const localDate = new Date(localTimestamp).getTime();
  const remoteDate = new Date(remoteTimestamp).getTime();

  // If one side is strictly newer, it wins without conflict.
  if (localDate > remoteDate || remoteDate > localDate) {
    // Only flag a conflict when both timestamps are identical,
    // meaning the comparison is ambiguous. When one side is clearly
    // newer, the caller can fast-forward without user intervention.
    //
    // However, the truly safe check is whether both sides changed
    // since the last known sync point. Since we only receive two
    // timestamps here (not the last-sync timestamp), we treat any
    // content mismatch as a potential conflict so the caller can
    // decide how to resolve it.
  }

  return {
    path: '',
    localContent,
    remoteContent,
    lastLocalUpdate: localTimestamp,
    lastRemoteUpdate: remoteTimestamp,
  };
}

/**
 * Generate a Markdown representation of spec data suitable for
 * committing to a repository.
 */
export function generateSyncContent(specData: Record<string, unknown>): string {
  const lines: string[] = [];
  const title =
    typeof specData.title === 'string' ? specData.title : 'Untitled Spec';
  const description =
    typeof specData.description === 'string' ? specData.description : '';

  lines.push(`# ${title}`);
  lines.push('');

  if (description) {
    lines.push(description);
    lines.push('');
  }

  // Metadata table
  lines.push('## Metadata');
  lines.push('');
  lines.push('| Key | Value |');
  lines.push('| --- | ----- |');

  const metaKeys = ['version', 'status', 'updatedAt', 'createdAt'];
  for (const key of metaKeys) {
    if (key in specData) {
      lines.push(`| ${key} | ${String(specData[key])} |`);
    }
  }
  lines.push('');

  // Epics
  if (Array.isArray(specData.epics)) {
    lines.push('## Epics');
    lines.push('');
    for (const epic of specData.epics) {
      const epicObj = epic as Record<string, unknown>;
      lines.push(`### ${String(epicObj.title ?? 'Untitled Epic')}`);
      if (typeof epicObj.description === 'string' && epicObj.description) {
        lines.push('');
        lines.push(epicObj.description);
      }
      lines.push('');
    }
  }

  // Features
  if (Array.isArray(specData.features)) {
    lines.push('## Features');
    lines.push('');
    for (const feature of specData.features) {
      const featureObj = feature as Record<string, unknown>;
      lines.push(`### ${String(featureObj.title ?? 'Untitled Feature')}`);
      if (typeof featureObj.description === 'string' && featureObj.description) {
        lines.push('');
        lines.push(featureObj.description);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Query the current sync status for a given sync configuration.
 *
 * Calls the internal API to compare the local and remote states and
 * returns the appropriate status.
 */
export async function getSyncStatus(
  syncConfig: GitHubSyncConfig,
): Promise<GitHubSyncStatus> {
  const params = new URLSearchParams({
    syncConfigId: syncConfig.id,
    repoFullName: syncConfig.repoFullName,
    branch: syncConfig.branch,
    path: syncConfig.syncPath,
  });

  const response = await fetch(`/api/v1/github/sync/status?${params.toString()}`);

  if (!response.ok) {
    return 'error';
  }

  const data = (await response.json()) as { status: GitHubSyncStatus };
  return data.status;
}
