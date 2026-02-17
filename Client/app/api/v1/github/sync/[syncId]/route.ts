/**
 * GET    /api/v1/github/sync/:syncId - Get a single sync config
 * PATCH  /api/v1/github/sync/:syncId - Update sync config fields
 * DELETE /api/v1/github/sync/:syncId - Remove a sync config
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

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
 * Fetch a sync config from Strapi and verify it belongs to the requesting
 * organization. Returns the raw Strapi record or null.
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

/** Validate a sync path */
function isValidSyncPath(value: string): boolean {
  if (!value.startsWith('/')) return false;
  if (value.includes('..')) return false;
  return true;
}

/** Validate a git branch name */
function isValidBranch(value: string): boolean {
  if (!value || value.length === 0) return false;
  if (/\s/.test(value)) return false;
  if (value.startsWith('-')) return false;
  if (value.includes('..')) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleGet(
  _request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { syncId } = params;
  const item = await fetchAndVerifyOwnership(syncId, ctx.key.organizationId);

  if (!item) {
    return errors.notFound('Sync configuration');
  }

  return apiSuccess(mapSyncConfig(item), { corsOrigin: ctx.corsOrigin });
}

async function handlePatch(
  request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { syncId } = params;
  const existing = await fetchAndVerifyOwnership(syncId, ctx.key.organizationId);

  if (!existing) {
    return errors.notFound('Sync configuration');
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  const data: Record<string, unknown> = {};

  if (typeof body.syncPath === 'string') {
    if (!isValidSyncPath(body.syncPath)) {
      return errors.badRequest('Field "syncPath" must start with "/" and must not contain ".."');
    }
    data.syncPath = body.syncPath;
  }

  if (typeof body.branch === 'string') {
    if (!isValidBranch(body.branch)) {
      return errors.badRequest('Field "branch" must be a valid git branch name');
    }
    data.branch = body.branch;
  }

  if (typeof body.autoSync === 'boolean') {
    data.autoSync = body.autoSync;
  }

  if (Object.keys(data).length === 0) {
    return errors.badRequest('No valid fields to update');
  }

  const response = await fetch(`${STRAPI_URL}/api/github-sync-configs/${syncId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Sync configuration');
    logger.error('v1-github-sync', 'Strapi update failed', {
      status: response.status,
      syncId,
    });
    return errors.internal('Failed to update sync configuration');
  }

  const updated = await response.json();
  return apiSuccess(mapSyncConfig(updated.data), { corsOrigin: ctx.corsOrigin });
}

async function handleDelete(
  _request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { syncId } = params;
  const existing = await fetchAndVerifyOwnership(syncId, ctx.key.organizationId);

  if (!existing) {
    return errors.notFound('Sync configuration');
  }

  const response = await fetch(`${STRAPI_URL}/api/github-sync-configs/${syncId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Sync configuration');
    logger.error('v1-github-sync', 'Strapi delete failed', {
      status: response.status,
      syncId,
    });
    return errors.internal('Failed to delete sync configuration');
  }

  const deleteResponse = new NextResponse(null, { status: 204 });
  if (ctx.corsOrigin) {
    deleteResponse.headers.set('Access-Control-Allow-Origin', ctx.corsOrigin);
  }
  return deleteResponse;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withApiMiddleware(async (req, ctx, params) => handleGet(req, ctx, params));
export const PATCH = withApiMiddleware(async (req, ctx, params) => handlePatch(req, ctx, params));
export const DELETE = withApiMiddleware(async (req, ctx, params) => handleDelete(req, ctx, params));
