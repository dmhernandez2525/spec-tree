/**
 * GET /api/v1/specs/:specId/epics/:epicId - Get an epic
 * PUT /api/v1/specs/:specId/epics/:epicId - Update an epic
 * DELETE /api/v1/specs/:specId/epics/:epicId - Delete an epic
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

function mapEpic(item: Record<string, unknown>) {
  return {
    id: item.documentId || item.id,
    title: item.title || '',
    description: item.description || '',
    goal: item.goal || '',
    successCriteria: item.successCriteria || '',
    dependencies: item.dependencies || '',
    timeline: item.timeline || '',
    resources: item.resources || '',
    notes: item.notes || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function handleGet(_request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { epicId } = params;
  const response = await fetch(`${STRAPI_URL}/api/epics/${epicId}?populate=features`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Epic');
    logger.error('v1-epics', 'Strapi fetch failed', { status: response.status });
    return errors.internal('Failed to fetch epic');
  }

  const body = await response.json();
  const epic = {
    ...mapEpic(body.data),
    featureCount: Array.isArray(body.data.features) ? body.data.features.length : 0,
  };
  return apiSuccess(epic, { corsOrigin: ctx.corsOrigin });
}

async function handlePut(request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { epicId } = params;
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  const fields = ['title', 'description', 'goal', 'successCriteria', 'dependencies', 'timeline', 'resources', 'notes'];
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (typeof body[field] === 'string') data[field] = body[field];
  }

  if (Object.keys(data).length === 0) {
    return errors.badRequest('No valid fields to update');
  }

  const response = await fetch(`${STRAPI_URL}/api/epics/${epicId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Epic');
    logger.error('v1-epics', 'Strapi update failed', { status: response.status });
    return errors.internal('Failed to update epic');
  }

  const updated = await response.json();
  return apiSuccess(mapEpic(updated.data), { corsOrigin: ctx.corsOrigin });
}

async function handleDelete(_request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { epicId } = params;
  const response = await fetch(`${STRAPI_URL}/api/epics/${epicId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Epic');
    logger.error('v1-epics', 'Strapi delete failed', { status: response.status });
    return errors.internal('Failed to delete epic');
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
