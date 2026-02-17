/**
 * DELETE /api/v1/github/issues/:linkId - Remove an issue link
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch an issue link from Strapi and verify it belongs to the requesting
 * organization. Returns the raw Strapi record or null.
 */
async function fetchAndVerifyOwnership(
  linkId: string,
  organizationId: string,
): Promise<Record<string, unknown> | null> {
  const response = await fetch(`${STRAPI_URL}/api/github-issue-links/${linkId}`, {
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

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function handleDelete(
  _request: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>,
) {
  const { linkId } = params;
  const existing = await fetchAndVerifyOwnership(linkId, ctx.key.organizationId);

  if (!existing) {
    return errors.notFound('Issue link');
  }

  const response = await fetch(`${STRAPI_URL}/api/github-issue-links/${linkId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Issue link');
    logger.error('v1-github-issues', 'Strapi delete failed', {
      status: response.status,
      linkId,
    });
    return errors.internal('Failed to delete issue link');
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

export const DELETE = withApiMiddleware(async (req, ctx, params) => handleDelete(req, ctx, params));
