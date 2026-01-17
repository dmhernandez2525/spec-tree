import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

// POST /api/organizations/invites
export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role, message, organizationId } = body;

    if (!email || !organizationId) {
      return NextResponse.json(
        { error: 'Email and organizationId are required' },
        { status: 400 }
      );
    }

    // Create invite in Strapi
    const response = await fetch(`${STRAPI_URL}/api/organization-invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          email,
          role: role || 'member',
          message: message || '',
          organization: organizationId,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create invite');
    }

    const data = await response.json();

    // In a production environment, you would send an email here
    // using a service like SendGrid, Resend, etc.

    return NextResponse.json({
      id: data.data.id,
      ...data.data.attributes,
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
