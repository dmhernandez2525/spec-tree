/**
 * POST   /api/v1/github/auth - Exchange OAuth code for token and store connection
 * DELETE /api/v1/github/auth - Revoke GitHub token and remove connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_API = 'https://api.github.com';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch the existing GitHub connection for an organization from Strapi.
 * Returns the record or null if none exists.
 */
async function getExistingConnection(
  organizationId: string,
): Promise<Record<string, unknown> | null> {
  const url =
    `${STRAPI_URL}/api/github-connections` +
    `?filters[organizationId][$eq]=${encodeURIComponent(organizationId)}` +
    `&pagination[pageSize]=1`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!response.ok) return null;

  const body = await response.json();
  const items = body.data as Record<string, unknown>[] | undefined;
  if (!items || items.length === 0) return null;

  return items[0];
}

/**
 * Encrypt a token for storage. Uses a simple base64 encoding as a placeholder;
 * in production this should use AES-256-GCM with a server-side key.
 */
function encryptToken(token: string): string {
  return Buffer.from(token).toString('base64');
}

/**
 * Decrypt a stored token.
 */
function decryptToken(encrypted: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handlePost(request: NextRequest, ctx: ApiContext) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  const code = body.code;
  if (!code || typeof code !== 'string') {
    return errors.badRequest('Field "code" is required and must be a string');
  }

  const state = body.state;
  if (!state || typeof state !== 'string') {
    return errors.badRequest('Field "state" is required and must be a string');
  }

  // Exchange the OAuth code for an access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      state,
    }),
  });

  if (!tokenResponse.ok) {
    logger.error('v1-github-auth', 'GitHub token exchange failed', {
      status: tokenResponse.status,
    });
    return errors.internal('Failed to exchange OAuth code for token');
  }

  const tokenData = (await tokenResponse.json()) as Record<string, unknown>;
  const accessToken = tokenData.access_token;
  if (!accessToken || typeof accessToken !== 'string') {
    const errorDesc = tokenData.error_description || tokenData.error || 'Unknown error';
    return errors.badRequest(`GitHub OAuth error: ${errorDesc}`);
  }

  // Fetch GitHub user info to store alongside the connection
  const userResponse = await fetch(`${GITHUB_API}/user`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let githubUsername = '';
  if (userResponse.ok) {
    const userData = (await userResponse.json()) as Record<string, unknown>;
    githubUsername = (userData.login as string) || '';
  }

  const organizationId = ctx.key.organizationId;
  const encryptedToken = encryptToken(accessToken);

  // Upsert: check for existing connection
  const existing = await getExistingConnection(organizationId);

  if (existing) {
    const docId = existing.documentId || existing.id;
    const updateResponse = await fetch(`${STRAPI_URL}/api/github-connections/${docId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          encryptedToken,
          githubUsername,
          status: 'connected',
        },
      }),
    });

    if (!updateResponse.ok) {
      logger.error('v1-github-auth', 'Strapi update failed', {
        status: updateResponse.status,
      });
      return errors.internal('Failed to update GitHub connection');
    }
  } else {
    const createResponse = await fetch(`${STRAPI_URL}/api/github-connections`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          organizationId,
          encryptedToken,
          githubUsername,
          status: 'connected',
        },
      }),
    });

    if (!createResponse.ok) {
      logger.error('v1-github-auth', 'Strapi create failed', {
        status: createResponse.status,
      });
      return errors.internal('Failed to store GitHub connection');
    }
  }

  return apiSuccess(
    { authStatus: 'connected', githubUsername },
    { status: 201, corsOrigin: ctx.corsOrigin },
  );
}

async function handleDelete(_request: NextRequest, ctx: ApiContext) {
  const organizationId = ctx.key.organizationId;
  const existing = await getExistingConnection(organizationId);

  if (!existing) {
    return errors.notFound('GitHub connection');
  }

  // Attempt to revoke the token on GitHub
  const encryptedToken = existing.encryptedToken as string | undefined;
  if (encryptedToken) {
    try {
      const token = decryptToken(encryptedToken);
      await fetch(`${GITHUB_API}/applications/${GITHUB_CLIENT_ID}/token`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${Buffer.from(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: token }),
      });
    } catch (err) {
      // Log but do not block deletion if revocation fails
      logger.error('v1-github-auth', 'Token revocation failed', { error: err });
    }
  }

  // Remove from Strapi
  const docId = existing.documentId || existing.id;
  const deleteResponse = await fetch(`${STRAPI_URL}/api/github-connections/${docId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  });

  if (!deleteResponse.ok) {
    logger.error('v1-github-auth', 'Strapi delete failed', {
      status: deleteResponse.status,
    });
    return errors.internal('Failed to remove GitHub connection');
  }

  return apiSuccess(
    { authStatus: 'disconnected' },
    { corsOrigin: ctx.corsOrigin },
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const POST = withApiMiddleware(async (req, ctx) => handlePost(req, ctx));
export const DELETE = withApiMiddleware(async (req, ctx) => handleDelete(req, ctx));
export const OPTIONS = withApiMiddleware(async () => {
  return new NextResponse(null, { status: 204 });
});
