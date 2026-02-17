/**
 * GET /api/v1/specs/:specId/epics/:epicId/features/:featureId - Get a feature
 * PUT /api/v1/specs/:specId/epics/:epicId/features/:featureId - Update a feature
 * DELETE /api/v1/specs/:specId/epics/:epicId/features/:featureId - Delete a feature
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

function mapFeature(item: Record<string, unknown>) {
  return {
    id: item.documentId || item.id,
    title: item.title || '',
    description: item.description || '',
    details: item.details || '',
    notes: item.notes || '',
    priority: item.priority || null,
    effort: item.effort || null,
    acceptanceCriteria: item.acceptanceCriteria || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function handleGet(_request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { featureId } = params;
  const response = await fetch(`${STRAPI_URL}/api/features/${featureId}?populate=userStories`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Feature');
    logger.error('v1-features', 'Strapi fetch failed', { status: response.status });
    return errors.internal('Failed to fetch feature');
  }

  const body = await response.json();
  const feature = {
    ...mapFeature(body.data),
    userStoryCount: Array.isArray(body.data.userStories) ? body.data.userStories.length : 0,
  };
  return apiSuccess(feature, { corsOrigin: ctx.corsOrigin });
}

async function handlePut(request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { featureId } = params;
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  const fields = ['title', 'description', 'details', 'notes', 'priority', 'effort'];
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (typeof body[field] === 'string') data[field] = body[field];
  }
  if (Array.isArray(body.acceptanceCriteria)) {
    data.acceptanceCriteria = body.acceptanceCriteria;
  }

  if (Object.keys(data).length === 0) {
    return errors.badRequest('No valid fields to update');
  }

  const response = await fetch(`${STRAPI_URL}/api/features/${featureId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Feature');
    logger.error('v1-features', 'Strapi update failed', { status: response.status });
    return errors.internal('Failed to update feature');
  }

  const updated = await response.json();
  return apiSuccess(mapFeature(updated.data), { corsOrigin: ctx.corsOrigin });
}

async function handleDelete(_request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { featureId } = params;
  const response = await fetch(`${STRAPI_URL}/api/features/${featureId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Feature');
    logger.error('v1-features', 'Strapi delete failed', { status: response.status });
    return errors.internal('Failed to delete feature');
  }

  const deleteResponse = new NextResponse(null, { status: 204 });
  if (ctx.corsOrigin) {
    deleteResponse.headers.set('Access-Control-Allow-Origin', ctx.corsOrigin);
  }
  return deleteResponse;
}

export const GET = withApiMiddleware(async (req, ctx, params) => handleGet(req, ctx, params));
export const PUT = withApiMiddleware(async (req, ctx, params) => handlePut(req, ctx, params));
export const DELETE = withApiMiddleware(async (req, ctx, params) => handleDelete(req, ctx, params));
