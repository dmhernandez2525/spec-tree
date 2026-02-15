import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

interface StrapiOrganization {
  documentId: string;
  name: string;
  avatarUrl?: string;
}

interface StrapiMember {
  documentId: string;
  userId: string;
  role: string;
  organization?: StrapiOrganization;
}

interface StrapiCollectionResponse<T> {
  data: T[];
}

interface StrapiSingleResponse<T> {
  data: T;
}

interface WorkspaceSummary {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

// GET /api/organizations/workspaces?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch all memberships for this user
    const membersResponse = await fetch(
      `${STRAPI_URL}/api/organization-members?filters[userId][$eq]=${userId}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!membersResponse.ok) {
      throw new Error('Failed to fetch organization memberships');
    }

    const membersData: StrapiCollectionResponse<StrapiMember> =
      await membersResponse.json();

    // For each membership, build a WorkspaceSummary.
    // If the organization is populated via populate=*, use it directly.
    // Otherwise, fetch each organization individually.
    const workspaces: WorkspaceSummary[] = [];

    for (const member of membersData.data) {
      if (member.organization) {
        workspaces.push({
          id: member.organization.documentId,
          name: member.organization.name,
          role: member.role,
          avatarUrl: member.organization.avatarUrl || null,
        });
        continue;
      }

      // Fallback: fetch organization separately if not populated
      const orgResponse = await fetch(
        `${STRAPI_URL}/api/organizations/${member.documentId}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (orgResponse.ok) {
        const orgData: StrapiSingleResponse<StrapiOrganization> =
          await orgResponse.json();
        workspaces.push({
          id: orgData.data.documentId,
          name: orgData.data.name,
          role: member.role,
          avatarUrl: orgData.data.avatarUrl || null,
        });
      }
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    logger.error('organizations/workspaces', 'Failed to fetch workspaces', { error });
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}
