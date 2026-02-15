import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

// DELETE /api/organizations/[organizationId]/templates/[templateId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${STRAPI_URL}/api/organization-templates/${templateId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete template');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('organizations/templates', 'Failed to delete template', { error });
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
