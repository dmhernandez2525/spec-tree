import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

// GET /api/organizations/[organizationId]/settings/ai
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
      `${STRAPI_URL}/api/ai-settings?filters[organization][id][$eq]=${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      // Return default settings if none exist
      return NextResponse.json({
        useOwnKeys: false,
        defaultProvider: 'openai',
        defaultModel: 'gpt-4o',
        apiKeys: {},
        settings: {
          temperature: 0.7,
          maxTokens: 4096,
          frequencyPenalty: 0.5,
          presencePenalty: 0.5,
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data.data?.[0]?.attributes || {
      useOwnKeys: false,
      defaultProvider: 'openai',
      defaultModel: 'gpt-4o',
      apiKeys: {},
      settings: {
        temperature: 0.7,
        maxTokens: 4096,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
      },
    });
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI settings' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[organizationId]/settings/ai
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

    // First check if settings exist
    const existingResponse = await fetch(
      `${STRAPI_URL}/api/ai-settings?filters[organization][id][$eq]=${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const existingData = existingResponse.ok ? await existingResponse.json() : { data: [] };
    const existingSettings = existingData.data?.[0];

    let response;
    if (existingSettings) {
      // Update existing settings
      response = await fetch(
        `${STRAPI_URL}/api/ai-settings/${existingSettings.id}`,
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
      // Create new settings
      response = await fetch(`${STRAPI_URL}/api/ai-settings`, {
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
      throw new Error('Failed to update AI settings');
    }

    const data = await response.json();
    return NextResponse.json(data.data?.attributes || body);
  } catch (error) {
    console.error('Error updating AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to update AI settings' },
      { status: 500 }
    );
  }
}
