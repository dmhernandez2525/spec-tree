/**
 * POST /api/v1/github/pr - Create a pull request on GitHub
 *
 * Accepts { title, body, branch, baseBranch, repoFullName, files }.
 * Creates a new branch, commits all provided files, then opens a PR.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/api/api-middleware';
import { apiSuccess, errors } from '@/lib/api/api-response';
import { logger } from '@/lib/logger';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';
const GITHUB_API = 'https://api.github.com';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PrFile {
  path: string;
  content: string;
}

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

/** Helper to make authenticated GitHub API requests */
async function ghFetch(
  token: string,
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${GITHUB_API}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

/**
 * Get the SHA of the latest commit on a branch.
 */
async function getBranchHeadSha(
  token: string,
  repoFullName: string,
  branch: string,
): Promise<string | null> {
  const response = await ghFetch(
    token,
    `/repos/${repoFullName}/git/ref/heads/${encodeURIComponent(branch)}`,
  );

  if (!response.ok) return null;

  const data = (await response.json()) as Record<string, unknown>;
  const obj = data.object as Record<string, unknown> | undefined;
  return (obj?.sha as string) || null;
}

/**
 * Create a new branch from a given SHA.
 */
async function createBranch(
  token: string,
  repoFullName: string,
  branchName: string,
  sha: string,
): Promise<boolean> {
  const response = await ghFetch(token, `/repos/${repoFullName}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha,
    }),
  });

  return response.ok;
}

/**
 * Create a blob for file content.
 */
async function createBlob(
  token: string,
  repoFullName: string,
  content: string,
): Promise<string | null> {
  const response = await ghFetch(token, `/repos/${repoFullName}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({
      content: Buffer.from(content).toString('base64'),
      encoding: 'base64',
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as Record<string, unknown>;
  return (data.sha as string) || null;
}

/**
 * Create a tree with the provided files.
 */
async function createTree(
  token: string,
  repoFullName: string,
  baseTreeSha: string,
  files: Array<{ path: string; blobSha: string }>,
): Promise<string | null> {
  const tree = files.map((f) => ({
    path: f.path.startsWith('/') ? f.path.slice(1) : f.path,
    mode: '100644' as const,
    type: 'blob' as const,
    sha: f.blobSha,
  }));

  const response = await ghFetch(token, `/repos/${repoFullName}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as Record<string, unknown>;
  return (data.sha as string) || null;
}

/**
 * Create a commit pointing to the given tree.
 */
async function createCommit(
  token: string,
  repoFullName: string,
  message: string,
  treeSha: string,
  parentSha: string,
): Promise<string | null> {
  const response = await ghFetch(token, `/repos/${repoFullName}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: treeSha,
      parents: [parentSha],
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as Record<string, unknown>;
  return (data.sha as string) || null;
}

/**
 * Update a branch ref to point to a new commit.
 */
async function updateBranchRef(
  token: string,
  repoFullName: string,
  branch: string,
  commitSha: string,
): Promise<boolean> {
  const response = await ghFetch(
    token,
    `/repos/${repoFullName}/git/refs/heads/${encodeURIComponent(branch)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ sha: commitSha }),
    },
  );

  return response.ok;
}

/**
 * Create a pull request.
 */
async function createPullRequest(
  token: string,
  repoFullName: string,
  title: string,
  body: string,
  head: string,
  base: string,
): Promise<Record<string, unknown> | null> {
  const response = await ghFetch(token, `/repos/${repoFullName}/pulls`, {
    method: 'POST',
    body: JSON.stringify({ title, body, head, base }),
  });

  if (!response.ok) return null;

  return (await response.json()) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function handlePost(request: NextRequest, ctx: ApiContext) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errors.badRequest('Invalid JSON body');
  }

  // Validate required fields
  const title = body.title;
  if (!title || typeof title !== 'string') {
    return errors.badRequest('Field "title" is required and must be a string');
  }

  const prBody = typeof body.body === 'string' ? body.body : '';

  const branch = body.branch;
  if (!branch || typeof branch !== 'string') {
    return errors.badRequest('Field "branch" is required and must be a string');
  }

  const baseBranch = body.baseBranch;
  if (!baseBranch || typeof baseBranch !== 'string') {
    return errors.badRequest('Field "baseBranch" is required and must be a string');
  }

  const repoFullName = body.repoFullName;
  if (!repoFullName || typeof repoFullName !== 'string') {
    return errors.badRequest('Field "repoFullName" is required and must be a string');
  }

  const files = body.files;
  if (!Array.isArray(files) || files.length === 0) {
    return errors.badRequest('Field "files" is required and must be a non-empty array');
  }

  // Validate each file entry
  const validatedFiles: PrFile[] = [];
  for (const file of files) {
    const f = file as Record<string, unknown>;
    if (!f.path || typeof f.path !== 'string') {
      return errors.badRequest('Each file must have a "path" string');
    }
    if (typeof f.content !== 'string') {
      return errors.badRequest('Each file must have a "content" string');
    }
    validatedFiles.push({ path: f.path, content: f.content });
  }

  // Get GitHub token
  const token = await getGitHubToken(ctx.key.organizationId);
  if (!token) {
    return errors.badRequest('No active GitHub connection. Please connect GitHub first.');
  }

  // Step 1: Get the HEAD SHA of the base branch
  const baseSha = await getBranchHeadSha(token, repoFullName, baseBranch);
  if (!baseSha) {
    return errors.badRequest(`Could not find base branch "${baseBranch}" in repository`);
  }

  // Step 2: Create the new branch from base
  const branchCreated = await createBranch(token, repoFullName, branch, baseSha);
  if (!branchCreated) {
    return errors.badRequest(`Failed to create branch "${branch}". It may already exist.`);
  }

  // Step 3: Create blobs for each file
  const blobEntries: Array<{ path: string; blobSha: string }> = [];
  for (const file of validatedFiles) {
    const blobSha = await createBlob(token, repoFullName, file.content);
    if (!blobSha) {
      logger.error('v1-github-pr', 'Failed to create blob', { path: file.path });
      return errors.internal(`Failed to create blob for file: ${file.path}`);
    }
    blobEntries.push({ path: file.path, blobSha });
  }

  // Step 4: Create a tree with all the file blobs
  const treeSha = await createTree(token, repoFullName, baseSha, blobEntries);
  if (!treeSha) {
    return errors.internal('Failed to create git tree');
  }

  // Step 5: Create a commit
  const commitSha = await createCommit(
    token,
    repoFullName,
    `${title}\n\n${prBody}`,
    treeSha,
    baseSha,
  );
  if (!commitSha) {
    return errors.internal('Failed to create git commit');
  }

  // Step 6: Update the branch ref to point to the new commit
  const refUpdated = await updateBranchRef(token, repoFullName, branch, commitSha);
  if (!refUpdated) {
    return errors.internal('Failed to update branch reference');
  }

  // Step 7: Create the pull request
  const pr = await createPullRequest(token, repoFullName, title, prBody, branch, baseBranch);
  if (!pr) {
    return errors.internal('Branch and commit created, but failed to open pull request');
  }

  return apiSuccess(
    {
      number: pr.number,
      title: pr.title,
      htmlUrl: pr.html_url,
      state: pr.state,
      branch,
      baseBranch,
      repoFullName,
    },
    { status: 201, corsOrigin: ctx.corsOrigin },
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const POST = withApiMiddleware(async (req, ctx) => handlePost(req, ctx));
export const OPTIONS = withApiMiddleware(async () => {
  return new NextResponse(null, { status: 204 });
});
