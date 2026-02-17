import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAuthorizationUrl,
  REQUIRED_SCOPES,
  GITHUB_OAUTH_URL,
  exchangeCodeForToken,
  validateToken,
} from './github-auth';

// ---------------------------------------------------------------------------
// REQUIRED_SCOPES
// ---------------------------------------------------------------------------

describe('REQUIRED_SCOPES', () => {
  it('includes "repo" scope', () => {
    expect(REQUIRED_SCOPES).toContain('repo');
  });

  it('includes "read:org" scope', () => {
    expect(REQUIRED_SCOPES).toContain('read:org');
  });

  it('includes "workflow" scope', () => {
    expect(REQUIRED_SCOPES).toContain('workflow');
  });
});

// ---------------------------------------------------------------------------
// getAuthorizationUrl
// ---------------------------------------------------------------------------

describe('getAuthorizationUrl', () => {
  it('builds a URL starting with the GitHub OAuth endpoint', () => {
    const url = getAuthorizationUrl('client123', 'http://localhost/callback', [
      'repo',
    ]);
    expect(url).toMatch(new RegExp(`^${GITHUB_OAUTH_URL}\\?`));
  });

  it('includes the client_id parameter', () => {
    const url = getAuthorizationUrl('my-client-id', 'http://localhost/cb', [
      'repo',
    ]);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('client_id')).toBe('my-client-id');
  });

  it('includes the redirect_uri parameter', () => {
    const url = getAuthorizationUrl('cid', 'http://localhost:3000/cb', [
      'repo',
    ]);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('redirect_uri')).toBe('http://localhost:3000/cb');
  });

  it('includes the required scopes joined by a space', () => {
    const scopes = ['repo', 'read:org', 'workflow'];
    const url = getAuthorizationUrl('cid', 'http://localhost/cb', scopes);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('scope')).toBe('repo read:org workflow');
  });

  it('includes a state parameter for CSRF protection', () => {
    const url = getAuthorizationUrl('cid', 'http://localhost/cb', ['repo']);
    const params = new URLSearchParams(url.split('?')[1]);
    const state = params.get('state');
    expect(state).toBeTruthy();
    expect(typeof state).toBe('string');
  });

  it('generates a unique state on each call', () => {
    const url1 = getAuthorizationUrl('cid', 'http://localhost/cb', ['repo']);
    const url2 = getAuthorizationUrl('cid', 'http://localhost/cb', ['repo']);
    const state1 = new URLSearchParams(url1.split('?')[1]).get('state');
    const state2 = new URLSearchParams(url2.split('?')[1]).get('state');
    expect(state1).not.toBe(state2);
  });
});

// ---------------------------------------------------------------------------
// exchangeCodeForToken
// ---------------------------------------------------------------------------

describe('exchangeCodeForToken', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls POST /api/v1/github/oauth/token with code and state', async () => {
    const tokenData = { accessToken: 'gho_abc123', tokenType: 'bearer' };
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => tokenData,
    } as Response);

    const result = await exchangeCodeForToken('code123', 'state456');

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/github/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'code123', state: 'state456' }),
    });
    expect(result).toEqual(tokenData);
  });

  it('throws an error when the response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid code' }),
    } as Response);

    await expect(exchangeCodeForToken('bad', 'state')).rejects.toThrow(
      'Invalid code',
    );
  });

  it('throws a fallback error when the server provides no error message', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(exchangeCodeForToken('bad', 'state')).rejects.toThrow(
      'Failed to exchange authorization code for token',
    );
  });
});

// ---------------------------------------------------------------------------
// validateToken
// ---------------------------------------------------------------------------

describe('validateToken', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns true when the API confirms the token is valid', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    } as Response);

    const result = await validateToken('gho_validToken');

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/github/oauth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'gho_validToken' }),
    });
    expect(result).toBe(true);
  });

  it('returns false when the API says the token is invalid', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: false }),
    } as Response);

    const result = await validateToken('gho_expiredToken');
    expect(result).toBe(false);
  });

  it('returns false when the response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    const result = await validateToken('gho_badToken');
    expect(result).toBe(false);
  });
});
