/**
 * GET  /api/v1/github/sync - List sync configurations for the organization
 * POST /api/v1/github/sync - Create a new sync configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, apiList, errors, parsePagination } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a Strapi sync config record to the public shape */
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

/** Validate a GitHub repository full name (owner/repo format) */
function isValidRepoFullName(value: string): boolean {
  return /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(value);
}

/** Validate a sync path (must start with /) */
function isValidSyncPath(value: string): boolean {
  if (!value.startsWith('/')) return false;
  // Reject path traversal attempts
  if (value.includes('..')) return false;
  return true;
}

/** Validate a git branch name */
function isValidBranch(value: string): boolean {
  // Reject empty, spaces, or control characters
  if (!value || value.length === 0) return false;
  if (/\s/.test(value)) return false;
  if (value.startsWith('-')) return false;
  if (value.includes('..')) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest, ctx: ApiContext) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePagination(searchParams);

  const orgFilter = ctx.key.organizationId
    ? `&filters[organizationId][$eq]=${encodeURIComponent(ctx.key.organizationId)}`
    : '';

  const url =
    `${STRAPI_URL}/api/github-sync-configs` +
    `?pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}` +
    `&sort=createdAt:desc` +
    orgFilter;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    logger.error('v1-github-sync', 'Strapi fetch failed', { status: response.status });
    return errors.internal('Failed to fetch sync configurations');
  }

  const body = await response.json();
  const configs = (body.data || []).map((item: Record<string, unknown>) => mapSyncConfig(item));
  const pagination = body.meta?.pagination || {
    page,
    pageSize,
    pageCount: 1,
    total: configs.length,
  };

  return apiList(configs, pagination, { corsOrigin: ctx.corsOrigin });
}

async function handlePost(request: NextRequest, ctx: ApiContext) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  // Validate repoFullName
  const repoFullName = body.repoFullName;
  if (!repoFullName || typeof repoFullName !== 'string') {
    return errors.badRequest('Field "repoFullName" is required and must be a string');
  }
  if (!isValidRepoFullName(repoFullName)) {
    return errors.badRequest('Field "repoFullName" must be in owner/repo format');
  }

  // Validate syncPath
  const syncPath = body.syncPath;
  if (!syncPath || typeof syncPath !== 'string') {
    return errors.badRequest('Field "syncPath" is required and must be a string');
  }
  if (!isValidSyncPath(syncPath)) {
    return errors.badRequest('Field "syncPath" must start with "/" and must not contain ".."');
  }

  // Validate branch
  const branch = body.branch;
  if (!branch || typeof branch !== 'string') {
    return errors.badRequest('Field "branch" is required and must be a string');
  }
  if (!isValidBranch(branch)) {
    return errors.badRequest('Field "branch" must be a valid git branch name');
  }

  // Optional fields
  const autoSync = typeof body.autoSync === 'boolean' ? body.autoSync : false;

  const payload = {
    data: {
      repoFullName,
      syncPath,
      branch,
      autoSync,
      syncStatus: 'idle',
      organizationId: ctx.key.organizationId || null,
    },
  };

  const strapiResponse = await fetch(`${STRAPI_URL}/api/github-sync-configs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!strapiResponse.ok) {
    logger.error('v1-github-sync', 'Strapi create failed', {
      status: strapiResponse.status,
    });
    return errors.internal('Failed to create sync configuration');
  }

  const created = await strapiResponse.json();
  return apiSuccess(mapSyncConfig(created.data), {
    status: 201,
    corsOrigin: ctx.corsOrigin,
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withApiMiddleware(async (req, ctx) => handleGet(req, ctx));
export const POST = withApiMiddleware(async (req, ctx) => handlePost(req, ctx));
export const OPTIONS = withApiMiddleware(async () => {
  return new NextResponse(null, { status: 204 });
});
