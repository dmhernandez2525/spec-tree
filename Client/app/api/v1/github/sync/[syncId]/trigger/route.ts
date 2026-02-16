/**
 * POST /api/v1/github/sync/:syncId/trigger - Trigger a manual sync to GitHub
 *
 * Fetches the sync config, pushes spec content to the configured GitHub repo
 * and path, then updates lastSyncAt and syncStatus in Strapi.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';
const GITHUB_API = 'https://api.github.com';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapSyncConfig(item: Record<string, unknown>): Record<string, unknown> {
  return {
    id: item.documentId || item.id,
    repoFullName: item.repoFullName || '',
    syncPath: item.syncPath || '/',
    branch: item.branch || 'main',
    autoSync: item.autoSync ?? false,
    syncStatus: item.syncStatus || 'idle',
    lastSyncAt: item.lastSyncAt || null,
    lastSyncError: item.lastSyncError || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Retrieve the stored GitHub access token for an organization.
 */
async function getGitHubToken(organizationId: string): Promise<string | null> {
  const url =
    `${STRAPI_URL}/api/github-connections` +
    `?filters[organizationId][$eq]=${encodeURIComponent(organizationId)}` +
    `&filters[status][$eq]=connected` +
    `&pagination[pageSize]=1`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) return null;

  const body = await response.json();
  const items = body.data as Record<string, unknown>[] | undefined;
  if (!items || items.length === 0) return null;

  const encrypted = items[0].encryptedToken as string | undefined;
  if (!encrypted) return null;

  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

/**
 * Fetch a sync config from Strapi and verify ownership.
 */
async function fetchAndVerifyOwnership(
  syncId: string,
  organizationId: string,
): Promise<Record<string, unknown> | null> {
  const response = await fetch(`${STRAPI_URL}/api/github-sync-configs/${syncId}`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) return null;

  const body = await response.json();
  const item = body.data as Record<string, unknown> | undefined;
  if (!item) return null;

  if (organizationId && item.organizationId !== organizationId) {
    return null;
  }

  return item;
}

/**
 * Update the sync status and timestamp in Strapi.
 */
async function updateSyncStatus(
  syncId: string,
  status: string,
  errorMessage?: string,
): Promise<Record<string, unknown> | null> {
  const data: Record<string, unknown> = {
    syncStatus: status,
    lastSyncAt: new Date().toISOString(),
  };

  if (errorMessage) {
    data.lastSyncError = errorMessage;
  } else {
    data.lastSyncError = null;
  }

  const response = await fetch(`${STRAPI_URL}/api/github-sync-configs/${syncId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) return null;

  const body = await response.json();
  return body.data as Record<string, unknown>;
}

/**
 * Push a file to a GitHub repository using the Contents API.
 * Creates or updates the file at the given path.
 */
async function pushFileToGitHub(
  token: string,
  repoFullName: string,
  branch: string,
  filePath: string,
  content: string,
  commitMessage: string,
): Promise<boolean> {
  const encodedContent = Buffer.from(content).toString('base64');
  const apiPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

  // Check if the file already exists (to get its SHA for updates)
  const existingResponse = await fetch(
    `${GITHUB_API}/repos/${repoFullName}/contents/${encodeURIComponent(apiPath)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );

  let sha: string | undefined;
  if (existingResponse.ok) {
    const existingData = (await existingResponse.json()) as Record<string, unknown>;
    sha = existingData.sha as string | undefined;
  }

  const payload: Record<string, unknown> = {
    message: commitMessage,
    content: encodedContent,
    branch,
  };
  if (sha) {
    payload.sha = sha;
  }

  const pushResponse = await fetch(
    `${GITHUB_API}/repos/${repoFullName}/contents/${encodeURIComponent(apiPath)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  return pushResponse.ok;
}

/**
 * Fetch exportable spec content from Strapi for the organization.
 * Returns the spec data as a JSON string ready to push to GitHub.
 */
async function fetchSpecContent(organizationId: string): Promise<string | null> {
  const url =
    `${STRAPI_URL}/api/specs` +
    `?filters[organizationId][$eq]=${encodeURIComponent(organizationId)}` +
    `&populate=epics.features` +
    `&pagination[pageSize]=100`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) return null;

  const body = await response.json();
  return JSON.stringify(body.data, null, 2);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function handlePost(
  _request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { syncId } = params;

  // Validate sync config exists and belongs to the org
  const config = await fetchAndVerifyOwnership(syncId, ctx.key.organizationId);
  if (!config) {
    return errors.notFound('Sync configuration');
  }

  // Get GitHub token
  const token = await getGitHubToken(ctx.key.organizationId);
  if (!token) {
    return errors.badRequest('No active GitHub connection. Please connect GitHub first.');
  }

  // Mark sync as in-progress
  await updateSyncStatus(syncId, 'syncing');

  const repoFullName = config.repoFullName as string;
  const syncPath = config.syncPath as string;
  const branch = config.branch as string;

  try {
    // Fetch spec content to push
    const content = await fetchSpecContent(ctx.key.organizationId);
    if (!content) {
      await updateSyncStatus(syncId, 'error', 'Failed to fetch spec content for export');
      return errors.internal('Failed to fetch spec content for sync');
    }

    // Build the target file path
    const targetPath = syncPath.endsWith('/')
      ? `${syncPath}spectree-spec.json`
      : `${syncPath}/spectree-spec.json`;

    const success = await pushFileToGitHub(
      token,
      repoFullName,
      branch,
      targetPath,
      content,
      `sync: update SpecTree spec content`,
    );

    if (!success) {
      await updateSyncStatus(syncId, 'error', 'Failed to push content to GitHub');
      return errors.internal('Failed to push content to GitHub repository');
    }

    // Mark sync as completed
    const updatedConfig = await updateSyncStatus(syncId, 'synced');
    if (!updatedConfig) {
      return errors.internal('Sync succeeded but failed to update status');
    }

    return apiSuccess(mapSyncConfig(updatedConfig), { corsOrigin: ctx.corsOrigin });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown sync error';
    logger.error('v1-github-sync-trigger', 'Sync failed', { syncId, error: message });
    await updateSyncStatus(syncId, 'error', message);
    return errors.internal(`Sync failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const POST = withApiMiddleware(async (req, ctx, params) => handlePost(req, ctx, params));
export const OPTIONS = withApiMiddleware(async () => {
  return new NextResponse(null, { status: 204 });
});
