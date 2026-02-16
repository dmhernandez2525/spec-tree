/**
 * GET /api/v1/specs/:specId/epics - List epics
 * POST /api/v1/specs/:specId/epics - Create an epic
 */

import { NextRequest } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, apiList, errors, parsePagination } from '@/lib/api/api-response';
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

async function handleGet(request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { specId } = params;
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePagination(searchParams);

  const url =
    `${STRAPI_URL}/api/epics` +
    `?filters[app][documentId][$eq]=${specId}` +
    `&pagination[page]=${page}&pagination[pageSize]=${pageSize}` +
    `&sort=createdAt:asc`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    logger.error('v1-epics', 'Strapi fetch failed', { status: response.status });
    return errors.internal('Failed to fetch epics');
  }

  const body = await response.json();
  const epics = (body.data || []).map(mapEpic);
  const pagination = body.meta?.pagination || { page, pageSize, pageCount: 1, total: epics.length };
  return apiList(epics, pagination, { corsOrigin: ctx.corsOrigin });
}

async function handlePost(request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { specId } = params;
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
      goal: typeof body.goal === 'string' ? body.goal : '',
      successCriteria: typeof body.successCriteria === 'string' ? body.successCriteria : '',
      dependencies: typeof body.dependencies === 'string' ? body.dependencies : '',
      timeline: typeof body.timeline === 'string' ? body.timeline : '',
      resources: typeof body.resources === 'string' ? body.resources : '',
      notes: typeof body.notes === 'string' ? body.notes : '',
      app: specId,
    },
  };

  const response = await fetch(`${STRAPI_URL}/api/epics`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    logger.error('v1-epics', 'Strapi create failed', { status: response.status });
    return errors.internal('Failed to create epic');
  }

  const created = await response.json();
  return apiSuccess(mapEpic(created.data), { status: 201, corsOrigin: ctx.corsOrigin });
}

export const GET = withApiMiddleware(async (req, ctx, params) => handleGet(req, ctx, params));
export const POST = withApiMiddleware(async (req, ctx, params) => handlePost(req, ctx, params));
