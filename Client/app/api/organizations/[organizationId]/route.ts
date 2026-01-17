import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

// GET /api/organizations/[organizationId]
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

    // Fetch organization data from Strapi
    const orgResponse = await fetch(
      `${STRAPI_URL}/api/organizations/${organizationId}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!orgResponse.ok) {
      throw new Error('Failed to fetch organization');
    }

    const orgData = await orgResponse.json();

    // Fetch members
    const membersResponse = await fetch(
      `${STRAPI_URL}/api/organization-members?filters[organization][id][$eq]=${organizationId}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const membersData = membersResponse.ok ? await membersResponse.json() : { data: [] };

    // Fetch invites
    const invitesResponse = await fetch(
      `${STRAPI_URL}/api/organization-invites?filters[organization][id][$eq]=${organizationId}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const invitesData = invitesResponse.ok ? await invitesResponse.json() : { data: [] };

    // Fetch subscription
    const subscriptionResponse = await fetch(
      `${STRAPI_URL}/api/subscriptions?filters[organization][id][$eq]=${organizationId}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const subscriptionData = subscriptionResponse.ok
      ? await subscriptionResponse.json()
      : { data: [] };

    return NextResponse.json({
      organization: orgData.data,
      members: membersData.data?.map((m: { id: string; attributes: Record<string, unknown> }) => ({
        id: m.id,
        ...m.attributes,
      })) || [],
      invites: invitesData.data?.map((i: { id: string; attributes: Record<string, unknown> }) => ({
        id: i.id,
        ...i.attributes,
      })) || [],
      subscription: subscriptionData.data?.[0]
        ? {
            id: subscriptionData.data[0].id,
            ...subscriptionData.data[0].attributes,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization data' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[organizationId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${STRAPI_URL}/api/organizations/${organizationId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: body }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update organization');
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}
