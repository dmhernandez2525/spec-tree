import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateBranchName,
  generatePRBody,
  getDiffPreview,
  createPRFromSpec,
} from './github-pr';

// ---------------------------------------------------------------------------
// generateBranchName
// ---------------------------------------------------------------------------

describe('generateBranchName', () => {
  it('creates a kebab-case branch with "spec/" prefix', () => {
    const result = generateBranchName('User Authentication Flow');
    expect(result).toBe('spec/user-authentication-flow');
  });

  it('truncates long names to 60 characters', () => {
    const longTitle =
      'This is an extremely long specification title that should definitely be truncated';
    const result = generateBranchName(longTitle);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).toMatch(/^spec\//);
  });

  it('removes trailing hyphens after truncation', () => {
    // Build a title that, when slugified and prefixed, lands a hyphen
    // right at the 60-char cut point.
    const title = 'a'.repeat(60);
    const result = generateBranchName(title);
    expect(result).not.toMatch(/-$/);
  });

  it('handles special characters by replacing them with hyphens', () => {
    const result = generateBranchName('feat: add @auth & SSO!');
    expect(result).toBe('spec/feat-add-auth-sso');
  });

  it('collapses consecutive hyphens', () => {
    const result = generateBranchName('hello   ---   world');
    expect(result).toBe('spec/hello-world');
  });

  it('converts uppercase to lowercase', () => {
    const result = generateBranchName('MY FEATURE');
    expect(result).toBe('spec/my-feature');
  });
});

// ---------------------------------------------------------------------------
// generatePRBody
// ---------------------------------------------------------------------------

describe('generatePRBody', () => {
  it('includes the title as an h2 heading', () => {
    const body = generatePRBody({ title: 'My Spec' });
    expect(body).toContain('## My Spec');
  });

  it('includes a Description section when description is provided', () => {
    const body = generatePRBody({
      title: 'Test',
      description: 'Some detailed description',
    });
    expect(body).toContain('### Description');
    expect(body).toContain('Some detailed description');
  });

  it('omits the Description section when description is empty', () => {
    const body = generatePRBody({ title: 'Test', description: '' });
    expect(body).not.toContain('### Description');
  });

  it('includes acceptance criteria as checkboxes', () => {
    const body = generatePRBody({
      title: 'Test',
      acceptanceCriteria: ['Login works', 'Session persists'],
    });
    expect(body).toContain('### Acceptance Criteria');
    expect(body).toContain('- [ ] Login works');
    expect(body).toContain('- [ ] Session persists');
  });

  it('omits acceptance criteria section when array is empty', () => {
    const body = generatePRBody({
      title: 'Test',
      acceptanceCriteria: [],
    });
    expect(body).not.toContain('### Acceptance Criteria');
  });

  it('includes tasks as checkboxes', () => {
    const body = generatePRBody({
      title: 'Test',
      tasks: [{ title: 'Build login page' }, { title: 'Write tests' }],
    });
    expect(body).toContain('### Tasks');
    expect(body).toContain('- [ ] Build login page');
    expect(body).toContain('- [ ] Write tests');
  });

  it('defaults to "Untitled Spec" when title is missing', () => {
    const body = generatePRBody({});
    expect(body).toContain('## Untitled Spec');
  });
});

// ---------------------------------------------------------------------------
// getDiffPreview
// ---------------------------------------------------------------------------

describe('getDiffPreview', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls the correct API endpoint with query parameters', async () => {
    const mockDiff = 'diff --git a/spec.md b/spec.md\n+new line';
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ diff: mockDiff }),
    } as Response);

    const result = await getDiffPreview('owner/repo', 'spec/feature', 'main');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/v1/github/pr/diff');
    expect(calledUrl).toContain('repo=owner%2Frepo');
    expect(calledUrl).toContain('branch=spec%2Ffeature');
    expect(calledUrl).toContain('base=main');
    expect(result).toBe(mockDiff);
  });

  it('throws an error when the response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Not found' }),
    } as Response);

    await expect(
      getDiffPreview('owner/repo', 'spec/feature', 'main'),
    ).rejects.toThrow('Not found');
  });
});

// ---------------------------------------------------------------------------
// createPRFromSpec
// ---------------------------------------------------------------------------

describe('createPRFromSpec', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls POST /api/v1/github/pr with the request body', async () => {
    const prResult = {
      number: 42,
      title: 'Test PR',
      url: 'https://api.github.com/repos/owner/repo/pulls/42',
      htmlUrl: 'https://github.com/owner/repo/pull/42',
      state: 'open',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: prResult }),
    } as Response);

    const request = {
      title: 'Test PR',
      body: '## Spec',
      branch: 'spec/feature',
      baseBranch: 'main',
      repoFullName: 'owner/repo',
      files: [{ path: 'spec.md', content: '# Spec' }],
    };

    const result = await createPRFromSpec(request);

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/github/pr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    expect(result).toEqual(prResult);
  });

  it('throws an error with the server message when response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Branch already exists' }),
    } as Response);

    await expect(
      createPRFromSpec({
        title: 'Test',
        body: '',
        branch: 'spec/x',
        baseBranch: 'main',
        repoFullName: 'owner/repo',
        files: [],
      }),
    ).rejects.toThrow('Branch already exists');
  });

  it('throws a fallback error when the server response has no error field', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(
      createPRFromSpec({
        title: 'Test',
        body: '',
        branch: 'spec/x',
        baseBranch: 'main',
        repoFullName: 'owner/repo',
        files: [],
      }),
    ).rejects.toThrow('Failed to create pull request from spec');
  });
});
