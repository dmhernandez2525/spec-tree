/**
 * GET /api/v1/specs/:specId/epics/:epicId/features - List features
 * POST /api/v1/specs/:specId/epics/:epicId/features - Create a feature
 */

import { NextRequest } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, apiList, errors, parsePagination } from '@/lib/api/api-response';
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
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function handleGet(request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { epicId } = params;
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePagination(searchParams);

  const url =
    `${STRAPI_URL}/api/features` +
    `?filters[epic][documentId][$eq]=${epicId}` +
    `&pagination[page]=${page}&pagination[pageSize]=${pageSize}` +
    `&sort=createdAt:asc`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    logger.error('v1-features', 'Strapi fetch failed', { status: response.status });
    return errors.internal('Failed to fetch features');
  }

  const body = await response.json();
  const features = (body.data || []).map(mapFeature);
  const pagination = body.meta?.pagination || { page, pageSize, pageCount: 1, total: features.length };
  return apiList(features, pagination, { corsOrigin: ctx.corsOrigin });
}

async function handlePost(request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { epicId } = params;
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  if (!body.title || typeof body.title !== 'string') {
    return errors.badRequest('Field "title" is required');
  }

  const payload = {
    data: {
      title: body.title,
      description: typeof body.description === 'string' ? body.description : '',
      details: typeof body.details === 'string' ? body.details : '',
      notes: typeof body.notes === 'string' ? body.notes : '',
      priority: typeof body.priority === 'string' ? body.priority : undefined,
      effort: typeof body.effort === 'string' ? body.effort : undefined,
      acceptanceCriteria: Array.isArray(body.acceptanceCriteria) ? body.acceptanceCriteria : [],
      epic: epicId,
    },
  };

  const response = await fetch(`${STRAPI_URL}/api/features`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    logger.error('v1-features', 'Strapi create failed', { status: response.status });
    return errors.internal('Failed to create feature');
  }

  const created = await response.json();
  return apiSuccess(mapFeature(created.data), { status: 201, corsOrigin: ctx.corsOrigin });
}

export const GET = withApiMiddleware(async (req, ctx, params) => handleGet(req, ctx, params));
export const POST = withApiMiddleware(async (req, ctx, params) => handlePost(req, ctx, params));
