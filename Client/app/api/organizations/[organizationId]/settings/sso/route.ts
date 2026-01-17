import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

// GET /api/organizations/[organizationId]/settings/sso
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

    const response = await fetch(
      `${STRAPI_URL}/api/sso-configs?filters[organization][id][$eq]=${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      // Return default SSO config if none exists
      return NextResponse.json({
        provider: null,
        enabled: false,
        enforceSSO: false,
        allowEmailLogin: true,
        config: {},
        domainRestrictions: [],
      });
    }

    const data = await response.json();
    return NextResponse.json(data.data?.[0]?.attributes || {
      provider: null,
      enabled: false,
      enforceSSO: false,
      allowEmailLogin: true,
      config: {},
      domainRestrictions: [],
    });
  } catch (error) {
    console.error('Error fetching SSO config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SSO configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[organizationId]/settings/sso
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

    // First check if SSO config exists
    const existingResponse = await fetch(
      `${STRAPI_URL}/api/sso-configs?filters[organization][id][$eq]=${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const existingData = existingResponse.ok ? await existingResponse.json() : { data: [] };
    const existingConfig = existingData.data?.[0];

    let response;
    if (existingConfig) {
      // Update existing config
      response = await fetch(
        `${STRAPI_URL}/api/sso-configs/${existingConfig.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: body }),
        }
      );
    } else {
      // Create new config
      response = await fetch(`${STRAPI_URL}/api/sso-configs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            ...body,
            organization: organizationId,
          },
        }),
      });
    }

    if (!response.ok) {
      throw new Error('Failed to update SSO configuration');
    }

    const data = await response.json();
    return NextResponse.json(data.data?.attributes || body);
  } catch (error) {
    console.error('Error updating SSO config:', error);
    return NextResponse.json(
      { error: 'Failed to update SSO configuration' },
      { status: 500 }
    );
  }
}
