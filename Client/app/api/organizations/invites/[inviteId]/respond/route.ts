import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

interface RespondBody {
  action: 'accept' | 'decline';
}

interface StrapiInvite {
  documentId: string;
  email: string;
  role: string;
  status: string;
  organization?: {
    documentId: string;
    id: number;
  };
}

interface StrapiSingleResponse<T> {
  data: T;
}

const VALID_ACTIONS: ReadonlyArray<string> = ['accept', 'decline'];

// POST /api/organizations/invites/[inviteId]/respond
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: RespondBody = await request.json();
    const { action } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: 'action must be either "accept" or "decline"' },
        { status: 400 }
      );
    }

    // Fetch the invite to get organization details (needed if accepting)
    const inviteResponse = await fetch(
      `${STRAPI_URL}/api/organization-invites/${inviteId}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!inviteResponse.ok) {
      throw new Error('Failed to fetch invite details');
    }

    const inviteData: StrapiSingleResponse<StrapiInvite> =
      await inviteResponse.json();
    const invite = inviteData.data;

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invite has already been responded to' },
        { status: 409 }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    // Update the invite status
    const updateResponse = await fetch(
      `${STRAPI_URL}/api/organization-invites/${inviteId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            status: newStatus,
            respondedAt: new Date().toISOString(),
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to update invite status');
    }

    // If accepting, create an organization-member record
    if (action === 'accept' && invite.organization) {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId') || '';

      const orgId = invite.organization.documentId || String(invite.organization.id);

      const memberResponse = await fetch(
        `${STRAPI_URL}/api/organization-members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              userId,
              email: invite.email,
              role: invite.role || 'member',
              joinedAt: new Date().toISOString(),
              organization: {
                connect: [orgId],
              },
            },
          }),
        }
      );

      if (!memberResponse.ok) {
        logger.error(
          'organizations/invites/respond',
          'Invite accepted but failed to create membership record',
          { inviteId }
        );
        return NextResponse.json(
          {
            error:
              'Invite accepted but failed to create membership. Please contact support.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
    });
  } catch (error) {
    logger.error(
      'organizations/invites/respond',
      'Failed to respond to invite',
      { error }
    );
    return NextResponse.json(
      { error: 'Failed to respond to invite' },
      { status: 500 }
    );
  }
}
