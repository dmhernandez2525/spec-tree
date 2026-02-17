/**
 * GitHub OAuth flow helpers for F3.1.3 - GitHub Integration
 *
 * Handles the authorization URL construction, code-for-token exchange,
 * token validation, and token revocation. All sensitive operations are
 * delegated to internal Next.js API routes so that client secrets
 * never leave the server.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base URL for GitHub's OAuth authorization endpoint */
export const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';

/** OAuth scopes required by the SpecTree GitHub integration */
export const REQUIRED_SCOPES: readonly string[] = [
  'repo',
  'read:org',
  'workflow',
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random state parameter for CSRF protection.
 * Falls back to Math.random when crypto.randomUUID is unavailable.
 */
function generateState(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build the full GitHub OAuth authorization URL.
 *
 * The returned URL includes a randomly generated `state` parameter for
 * CSRF protection. Callers should persist the state value (e.g. in
 * sessionStorage) and verify it when GitHub redirects back.
 */
export function getAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  scopes: string[],
): string {
  const state = generateState();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state,
  });

  return `${GITHUB_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange a temporary OAuth code for an access token.
 *
 * Delegates to the internal API route so the client secret stays
 * server-side.
 */
export async function exchangeCodeForToken(
  code: string,
  state: string,
): Promise<{ accessToken: string; tokenType: string }> {
  const response = await fetch('/api/v1/github/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Failed to exchange authorization code for token';
    throw new Error(message);
  }

  const data = (await response.json()) as { accessToken: string; tokenType: string };
  return data;
}

/**
 * Validate whether a GitHub access token is still active.
 *
 * Calls an internal API route that checks the token against the
 * GitHub API without exposing the token to third-party scripts.
 */
export async function validateToken(token: string): Promise<boolean> {
  const response = await fetch('/api/v1/github/oauth/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { valid: boolean };
  return data.valid;
}

/**
 * Revoke a GitHub OAuth access token.
 *
 * Delegates to the internal API route, which calls the GitHub
 * revocation endpoint using the client secret.
 */
export async function revokeToken(token: string): Promise<void> {
  const response = await fetch('/api/v1/github/oauth/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string' ? body.error : 'Failed to revoke token';
    throw new Error(message);
  }
}
