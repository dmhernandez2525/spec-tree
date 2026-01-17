import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

// PATCH /api/organizations/[organizationId]/members/[memberId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(
      `${STRAPI_URL}/api/organization-members/${memberId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { role: body.role } }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update member role');
    }

    const data = await response.json();
    return NextResponse.json({
      id: data.data.id,
      ...data.data.attributes,
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[organizationId]/members/[memberId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${STRAPI_URL}/api/organization-members/${memberId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove member');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
