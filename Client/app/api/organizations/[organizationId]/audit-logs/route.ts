import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

interface StrapiAuditLog {
  documentId: string;
  action: string;
  performedBy: string;
  targetType: string;
  targetId: string;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string;
  happenedAt: string;
}

interface StrapiPaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

interface StrapiPaginatedResponse<T> {
  data: T[];
  meta: StrapiPaginationMeta;
}

// GET /api/organizations/[organizationId]/audit-logs?page=1&pageSize=25
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '25';

    const url =
      `${STRAPI_URL}/api/organization-audit-logs` +
      `?filters[organization][id][$eq]=${organizationId}` +
      `&sort=happenedAt:desc` +
      `&pagination[page]=${page}` +
      `&pagination[pageSize]=${pageSize}` +
      `&populate=*`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    const data: StrapiPaginatedResponse<StrapiAuditLog> = await response.json();

    return NextResponse.json({
      auditLogs: data.data,
      pagination: data.meta.pagination,
    });
  } catch (error) {
    logger.error('organizations/audit-logs', 'Failed to fetch audit logs', { error });
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
