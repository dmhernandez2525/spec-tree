/**
 * GET /api/v1/github/repos - Fetch repositories from the connected GitHub account
 *
 * Query params:
 *   q        - Search filter for repository name
 *   page     - Page number (default 1)
 *   per_page - Results per page (default 30, max 100)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiList, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';
const GITHUB_API = 'https://api.github.com';

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

/** Map a GitHub repo object to a simpler public shape */
function mapRepo(repo: Record<string, unknown>): Record<string, unknown> {
  const owner = repo.owner as Record<string, unknown> | undefined;
  return {
    id: repo.id,
    fullName: repo.full_name,
    name: repo.name,
    private: repo.private,
    description: repo.description || null,
    defaultBranch: repo.default_branch || 'main',
    htmlUrl: repo.html_url,
    language: repo.language || null,
    updatedAt: repo.updated_at,
    owner: owner
      ? { login: owner.login, avatarUrl: owner.avatar_url }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest, ctx: ApiContext) {
  const token = await getGitHubToken(ctx.key.organizationId);
  if (!token) {
    return errors.badRequest('No active GitHub connection. Please connect GitHub first.');
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '30', 10) || 30));

  // If a search query is provided, use the GitHub search API; otherwise list user repos
  let githubUrl: string;
  if (query) {
    const searchQuery = `${query} in:name fork:true`;
    githubUrl =
      `${GITHUB_API}/search/repositories` +
      `?q=${encodeURIComponent(searchQuery)}` +
      `&page=${page}` +
      `&per_page=${perPage}` +
      `&sort=updated`;
  } else {
    githubUrl =
      `${GITHUB_API}/user/repos` +
      `?page=${page}` +
      `&per_page=${perPage}` +
      `&sort=updated` +
      `&affiliation=owner,collaborator,organization_member`;
  }

  const ghResponse = await fetch(githubUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!ghResponse.ok) {
    logger.error('v1-github-repos', 'GitHub API request failed', {
      status: ghResponse.status,
    });

    if (ghResponse.status === 401) {
      return errors.badRequest('GitHub token is invalid or expired. Please reconnect.');
    }

    return errors.internal('Failed to fetch repositories from GitHub');
  }

  const ghBody = await ghResponse.json();

  // Search endpoint wraps results in { items: [...], total_count }
  const rawRepos = query
    ? ((ghBody as Record<string, unknown>).items as Record<string, unknown>[]) || []
    : (ghBody as Record<string, unknown>[]) || [];
  const totalCount = query
    ? ((ghBody as Record<string, unknown>).total_count as number) || rawRepos.length
    : rawRepos.length;

  const repos = rawRepos.map(mapRepo);

  const pageCount = Math.ceil(totalCount / perPage) || 1;
  return apiList(repos, {
    page,
    pageSize: perPage,
    pageCount,
    total: totalCount,
  }, { corsOrigin: ctx.corsOrigin });
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withApiMiddleware(async (req, ctx) => handleGet(req, ctx));
export const OPTIONS = withApiMiddleware(async () => {
  return new NextResponse(null, { status: 204 });
});
