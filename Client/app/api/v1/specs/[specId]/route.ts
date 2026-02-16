/**
 * GET /api/v1/specs/:specId - Get a specification
 * PUT /api/v1/specs/:specId - Update a specification
 * DELETE /api/v1/specs/:specId - Delete a specification
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

function mapSpec(item: Record<string, unknown>) {
  return {
    id: item.documentId || item.id,
    name: item.name || '',
    globalInformation: item.globalInformation || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function handleGet(_request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { specId } = params;
  const response = await fetch(`${STRAPI_URL}/api/apps/${specId}?populate=epics`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Specification');
    logger.error('v1-specs', 'Strapi fetch failed', { status: response.status, specId });
    return errors.internal('Failed to fetch specification');
  }

  const body = await response.json();
  const spec = {
    ...mapSpec(body.data),
    epicCount: Array.isArray(body.data.epics) ? body.data.epics.length : 0,
  };

  return apiSuccess(spec, { corsOrigin: ctx.corsOrigin });
}

async function handlePut(request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { specId } = params;
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string') data.name = body.name;
  if (typeof body.globalInformation === 'string') data.globalInformation = body.globalInformation;

  if (Object.keys(data).length === 0) {
    return errors.badRequest('No valid fields to update');
  }

  const response = await fetch(`${STRAPI_URL}/api/apps/${specId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Specification');
    logger.error('v1-specs', 'Strapi update failed', { status: response.status, specId });
    return errors.internal('Failed to update specification');
  }

  const updated = await response.json();
  return apiSuccess(mapSpec(updated.data), { corsOrigin: ctx.corsOrigin });
}

async function handleDelete(_request: NextRequest, ctx: ApiContext, params: Record<string, string>) {
  const { specId } = params;
  const response = await fetch(`${STRAPI_URL}/api/apps/${specId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    if (response.status === 404) return errors.notFound('Specification');
    logger.error('v1-specs', 'Strapi delete failed', { status: response.status, specId });
    return errors.internal('Failed to delete specification');
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
