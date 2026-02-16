/**
 * GET /api/v1/docs - Serve the OpenAPI specification
 * This endpoint does NOT require authentication.
 */

import { NextResponse } from 'next/server';
import { getOpenApiSpec } from '@/lib/api/openapi-spec';

export async function GET() {
  const spec = getOpenApiSpec();
  return NextResponse.json(spec, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
