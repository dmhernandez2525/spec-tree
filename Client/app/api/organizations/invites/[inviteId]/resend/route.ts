import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

// POST /api/organizations/invites/[inviteId]/resend
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

    // First, get the invite details
    const getResponse = await fetch(
      `${STRAPI_URL}/api/organization-invites/${inviteId}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error('Invite not found');
    }

    const inviteData = await getResponse.json();

    // Update the invite with a new expiration date
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
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            status: 'pending',
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to resend invite');
    }

    // In a production environment, you would resend the email here
    // using a service like SendGrid, Resend, etc.

    return NextResponse.json({
      id: inviteData.data.id,
      ...inviteData.data.attributes,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error resending invite:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}
