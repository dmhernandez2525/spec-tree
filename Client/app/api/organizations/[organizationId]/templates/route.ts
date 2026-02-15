import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

interface StrapiTemplate {
  documentId: string;
  name: string;
  description: string;
  category: string;
  template: Record<string, unknown>;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface StrapiCollectionResponse<T> {
  data: T[];
}

interface CreateTemplateBody {
  name: string;
  description: string;
  category: string;
  template: Record<string, unknown>;
  createdById: string;
}

// GET /api/organizations/[organizationId]/templates
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
      `${STRAPI_URL}/api/organization-templates?filters[organization][id][$eq]=${organizationId}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    const data: StrapiCollectionResponse<StrapiTemplate> = await response.json();

    return NextResponse.json(data.data);
  } catch (error) {
    logger.error('organizations/templates', 'Failed to fetch templates', { error });
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[organizationId]/templates
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

    const body: CreateTemplateBody = await request.json();
    const { name, description, category, template, createdById } = body;

    if (!name || !createdById) {
      return NextResponse.json(
        { error: 'name and createdById are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${STRAPI_URL}/api/organization-templates`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            name,
            description: description || '',
            category: category || 'general',
            template: template || {},
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
      throw new Error(errorData.error?.message || 'Failed to create template');
    }

    const data = await response.json();

    return NextResponse.json(data.data, { status: 201 });
  } catch (error) {
    logger.error('organizations/templates', 'Failed to create template', { error });
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
