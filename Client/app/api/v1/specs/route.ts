/**
 * GET /api/v1/specs - List specifications
 * POST /api/v1/specs - Create a specification
 */

import { NextRequest } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, apiList, errors, parsePagination, parseSort } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

async function handleGet(request: NextRequest, ctx: ApiContext) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePagination(searchParams);
  const sort = parseSort(searchParams, ['name', 'createdAt', 'updatedAt']) || 'createdAt:desc';
  const search = searchParams.get('search') || '';

  let url = `${STRAPI_URL}/api/apps?pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=${sort}`;
  if (search) {
    url += `&filters[name][$containsi]=${encodeURIComponent(search)}`;
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    logger.error('v1-specs', 'Strapi fetch failed', { status: response.status });
    return errors.internal('Failed to fetch specifications');
  }

  const body = await response.json();
  const specs = (body.data || []).map((item: Record<string, unknown>) => ({
    id: item.documentId || item.id,
    name: item.name || '',
    globalInformation: item.globalInformation || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  const pagination = body.meta?.pagination || { page, pageSize, pageCount: 1, total: specs.length };
  return apiList(specs, pagination, { corsOrigin: ctx.corsOrigin });
}

async function handlePost(request: NextRequest, ctx: ApiContext) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  const name = body.name;
  if (!name || typeof name !== 'string') {
    return errors.badRequest('Field "name" is required');
  }

  const payload = {
    data: {
      name,
      globalInformation: typeof body.globalInformation === 'string' ? body.globalInformation : '',
      applactionInformation: typeof body.applicationInformation === 'string' ? body.applicationInformation : '',
    },
  };

  const response = await fetch(`${STRAPI_URL}/api/apps`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    logger.error('v1-specs', 'Strapi create failed', { status: response.status });
    return errors.internal('Failed to create specification');
  }

  const created = await response.json();
  const item = created.data;
  const spec = {
    id: item.documentId || item.id,
    name: item.name || '',
    globalInformation: item.globalInformation || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  return apiSuccess(spec, { status: 201, corsOrigin: ctx.corsOrigin });
}

export const GET = withApiMiddleware(async (request, ctx) => handleGet(request, ctx));
export const POST = withApiMiddleware(async (request, ctx) => handlePost(request, ctx));
export const OPTIONS = withApiMiddleware(async () => {
  const { NextResponse } = await import('next/server');
  return new NextResponse(null, { status: 204 });
});
