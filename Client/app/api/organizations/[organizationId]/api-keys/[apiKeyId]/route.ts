import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

// DELETE /api/organizations/[organizationId]/api-keys/[apiKeyId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; apiKeyId: string }> }
) {
  try {
    const { apiKeyId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${STRAPI_URL}/api/organization-api-keys/${apiKeyId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to revoke API key');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('organizations/api-keys', 'Failed to revoke API key', { error });
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
