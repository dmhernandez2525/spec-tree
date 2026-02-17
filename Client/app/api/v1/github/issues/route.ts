/**
 * GET  /api/v1/github/issues - List issue links, optionally filtered by specNodeId
 * POST /api/v1/github/issues - Create an issue link (optionally creating the issue on GitHub first)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, apiList, errors, parsePagination } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';
const GITHUB_API = 'https://api.github.com';

const VALID_SPEC_NODE_TYPES = ['spec', 'epic', 'feature'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Retrieve the stored GitHub access token for an organization.
 */
async function getGitHubToken(organizationId: string): Promise<string | null> {
  const url =
    `${STRAPI_URL}/api/github-connections` +
    `?filters[organizationId][$eq]=${encodeURIComponent(organizationId)}` +
    `&filters[status][$eq]=connected` +
    `&pagination[pageSize]=1`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) return null;

  const body = await response.json();
  const items = body.data as Record<string, unknown>[] | undefined;
  if (!items || items.length === 0) return null;

  const encrypted = items[0].encryptedToken as string | undefined;
  if (!encrypted) return null;

  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

/** Map a Strapi issue link record to the public shape */
function mapIssueLink(item: Record<string, unknown>): Record<string, unknown> {
  return {
    id: item.documentId || item.id,
    repoFullName: item.repoFullName || '',
    issueNumber: item.issueNumber || 0,
    issueTitle: item.issueTitle || '',
    issueUrl: item.issueUrl || '',
    issueState: item.issueState || 'open',
    specNodeType: item.specNodeType || '',
    specNodeId: item.specNodeId || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest, ctx: ApiContext) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePagination(searchParams);
  const specNodeId = searchParams.get('specNodeId');

  const orgFilter = ctx.key.organizationId
    ? `&filters[organizationId][$eq]=${encodeURIComponent(ctx.key.organizationId)}`
    : '';

  const nodeFilter = specNodeId
    ? `&filters[specNodeId][$eq]=${encodeURIComponent(specNodeId)}`
    : '';

  const url =
    `${STRAPI_URL}/api/github-issue-links` +
    `?pagination[page]=${page}` +
    `&pagination[pageSize]=${pageSize}` +
    `&sort=createdAt:desc` +
    orgFilter +
    nodeFilter;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) {
    logger.error('v1-github-issues', 'Strapi fetch failed', { status: response.status });
    return errors.internal('Failed to fetch issue links');
  }

  const body = await response.json();
  const links = (body.data || []).map((item: Record<string, unknown>) => mapIssueLink(item));
  const pagination = body.meta?.pagination || {
    page,
    pageSize,
    pageCount: 1,
    total: links.length,
  };

  return apiList(links, pagination, { corsOrigin: ctx.corsOrigin });
}

async function handlePost(request: NextRequest, ctx: ApiContext) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  // Required fields for all requests
  const repoFullName = body.repoFullName;
  if (!repoFullName || typeof repoFullName !== 'string') {
    return errors.badRequest('Field "repoFullName" is required and must be a string');
  }

  const specNodeType = body.specNodeType;
  if (!specNodeType || typeof specNodeType !== 'string') {
    return errors.badRequest('Field "specNodeType" is required and must be a string');
  }
  if (!VALID_SPEC_NODE_TYPES.includes(specNodeType as typeof VALID_SPEC_NODE_TYPES[number])) {
    return errors.badRequest(`Field "specNodeType" must be one of: ${VALID_SPEC_NODE_TYPES.join(', ')}`);
  }

  const specNodeId = body.specNodeId;
  if (!specNodeId || typeof specNodeId !== 'string') {
    return errors.badRequest('Field "specNodeId" is required and must be a string');
  }

  let issueNumber: number;
  let issueTitle = '';
  let issueUrl = '';
  let issueState = 'open';

  // Determine if we need to create a new issue on GitHub or link an existing one
  const hasCreateFields = typeof body.title === 'string' && body.title;
  const hasLinkFields = typeof body.issueNumber === 'number' && body.issueNumber > 0;

  if (hasCreateFields) {
    // Create a new issue on GitHub first
    const token = await getGitHubToken(ctx.key.organizationId);
    if (!token) {
      return errors.badRequest('No active GitHub connection. Please connect GitHub first.');
    }

    const title = body.title as string;
    const issueBody = typeof body.body === 'string' ? body.body : '';

    const ghResponse = await fetch(`${GITHUB_API}/repos/${repoFullName}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body: issueBody }),
    });

    if (!ghResponse.ok) {
      logger.error('v1-github-issues', 'GitHub issue creation failed', {
        status: ghResponse.status,
        repo: repoFullName,
      });

      if (ghResponse.status === 401) {
        return errors.badRequest('GitHub token is invalid or expired. Please reconnect.');
      }
      if (ghResponse.status === 404) {
        return errors.notFound('GitHub repository');
      }

      return errors.internal('Failed to create issue on GitHub');
    }

    const ghIssue = (await ghResponse.json()) as Record<string, unknown>;
    issueNumber = ghIssue.number as number;
    issueTitle = ghIssue.title as string;
    issueUrl = ghIssue.html_url as string;
    issueState = (ghIssue.state as string) || 'open';
  } else if (hasLinkFields) {
    // Link an existing issue
    issueNumber = body.issueNumber as number;

    // Optionally fetch issue metadata from GitHub
    const token = await getGitHubToken(ctx.key.organizationId);
    if (token) {
      const ghResponse = await fetch(
        `${GITHUB_API}/repos/${repoFullName}/issues/${issueNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        },
      );

      if (ghResponse.ok) {
        const ghIssue = (await ghResponse.json()) as Record<string, unknown>;
        issueTitle = (ghIssue.title as string) || '';
        issueUrl = (ghIssue.html_url as string) || '';
        issueState = (ghIssue.state as string) || 'open';
      }
    }

    // Build the URL if not fetched
    if (!issueUrl) {
      issueUrl = `https://github.com/${repoFullName}/issues/${issueNumber}`;
    }
  } else {
    return errors.badRequest(
      'Either "issueNumber" (to link existing) or "title" (to create new) must be provided',
    );
  }

  // Store the link in Strapi
  const payload = {
    data: {
      repoFullName,
      issueNumber,
      issueTitle,
      issueUrl,
      issueState,
      specNodeType,
      specNodeId,
      organizationId: ctx.key.organizationId || null,
    },
  };

  const strapiResponse = await fetch(`${STRAPI_URL}/api/github-issue-links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!strapiResponse.ok) {
    logger.error('v1-github-issues', 'Strapi create failed', {
      status: strapiResponse.status,
    });
    return errors.internal('Failed to store issue link');
  }

  const created = await strapiResponse.json();
  return apiSuccess(mapIssueLink(created.data), {
    status: 201,
    corsOrigin: ctx.corsOrigin,
  });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withApiMiddleware(async (req, ctx) => handleGet(req, ctx));
export const POST = withApiMiddleware(async (req, ctx) => handlePost(req, ctx));
export const OPTIONS = withApiMiddleware(async () => {
  return new NextResponse(null, { status: 204 });
});
