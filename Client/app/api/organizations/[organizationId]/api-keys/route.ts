import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

interface StrapiApiKey {
  documentId: string;
  provider: string;
  label: string;
  maskedKey: string;
  encryptedKey?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface StrapiCollectionResponse<T> {
  data: T[];
}

interface CreateApiKeyBody {
  provider: string;
  label: string;
  maskedKey: string;
  encryptedKey: string;
  createdById: string;
}

interface SafeApiKey {
  documentId: string;
  provider: string;
  label: string;
  maskedKey: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

function stripEncryptedKey(apiKey: StrapiApiKey): SafeApiKey {
  const { encryptedKey: _removed, ...safe } = apiKey;
  return safe;
}

// GET /api/organizations/[organizationId]/api-keys
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
      `${STRAPI_URL}/api/organization-api-keys?filters[organization][id][$eq]=${organizationId}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch API keys');
    }

    const data: StrapiCollectionResponse<StrapiApiKey> = await response.json();

    // Never expose encryptedKey to the client
    const safeKeys = data.data.map(stripEncryptedKey);

    return NextResponse.json(safeKeys);
  } catch (error) {
    logger.error('organizations/api-keys', 'Failed to fetch API keys', { error });
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[organizationId]/api-keys
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateApiKeyBody = await request.json();
    const { provider, label, maskedKey, encryptedKey, createdById } = body;

    if (!provider || !label || !maskedKey || !encryptedKey || !createdById) {
      return NextResponse.json(
        { error: 'provider, label, maskedKey, encryptedKey, and createdById are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${STRAPI_URL}/api/organization-api-keys`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            provider,
            label,
            maskedKey,
            encryptedKey,
            createdById,
            organization: {
              connect: [organizationId],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create API key');
    }

    const data = await response.json();

    // Return without the encryptedKey
    const safeKey = stripEncryptedKey(data.data);

    return NextResponse.json(safeKey, { status: 201 });
  } catch (error) {
    logger.error('organizations/api-keys', 'Failed to create API key', { error });
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
