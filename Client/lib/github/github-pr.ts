/**
 * Pull request generation utilities for F3.1.3 - GitHub Integration
 *
 * Creates pull requests from spec content, generates PR bodies and
 * branch names, and fetches diff previews. All GitHub API calls are
 * routed through internal Next.js API routes.
 */

import type { GitHubPRRequest, GitHubPRResult } from '@/types/github';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum length for generated branch names */
const MAX_BRANCH_LENGTH = 60;

/** Prefix applied to all spec-derived branch names */
const BRANCH_PREFIX = 'spec/';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a pull request from spec content.
 *
 * Sends the request payload to the internal API route, which handles
 * authentication and communicates with the GitHub API on the server side.
 */
export async function createPRFromSpec(
  request: GitHubPRRequest,
): Promise<GitHubPRResult> {
  const response = await fetch('/api/v1/github/pr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Failed to create pull request from spec';
    throw new Error(message);
  }

  const data = (await response.json()) as { data: GitHubPRResult };
  return data.data;
}

/**
 * Generate a Markdown pull request body from spec data.
 *
 * Includes the spec title, description, acceptance criteria (if present),
 * and a checklist of tasks derived from the spec content.
 */
export function generatePRBody(specData: Record<string, unknown>): string {
  const lines: string[] = [];

  const title =
    typeof specData.title === 'string' ? specData.title : 'Untitled Spec';
  const description =
    typeof specData.description === 'string' ? specData.description : '';

  // Title section
  lines.push(`## ${title}`);
  lines.push('');

  // Description section
  if (description) {
    lines.push('### Description');
    lines.push('');
    lines.push(description);
    lines.push('');
  }

  // Acceptance criteria
  if (Array.isArray(specData.acceptanceCriteria) && specData.acceptanceCriteria.length > 0) {
    lines.push('### Acceptance Criteria');
    lines.push('');
    for (const criterion of specData.acceptanceCriteria) {
      const text = typeof criterion === 'string' ? criterion : String(criterion);
      lines.push(`- [ ] ${text}`);
    }
    lines.push('');
  }

  // Tasks list
  if (Array.isArray(specData.tasks) && specData.tasks.length > 0) {
    lines.push('### Tasks');
    lines.push('');
    for (const task of specData.tasks) {
      const taskObj = task as Record<string, unknown>;
      const taskTitle =
        typeof taskObj.title === 'string' ? taskObj.title : String(task);
      lines.push(`- [ ] ${taskTitle}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate a branch name from a spec title.
 *
 * Converts the title to lowercase, replaces spaces and special characters
 * with hyphens, prefixes with `spec/`, collapses consecutive hyphens, and
 * truncates to 60 characters total.
 */
export function generateBranchName(specTitle: string): string {
  const slug = specTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const fullName = `${BRANCH_PREFIX}${slug}`;

  if (fullName.length <= MAX_BRANCH_LENGTH) {
    return fullName;
  }

  // Truncate and remove any trailing hyphen left after cutting
  return fullName.slice(0, MAX_BRANCH_LENGTH).replace(/-+$/, '');
}

/**
 * Fetch a diff preview between two branches in a repository.
 *
 * Calls the internal API route, which retrieves the comparison from
 * GitHub and returns the diff as a plain text string.
 */
export async function getDiffPreview(
  repoFullName: string,
  branch: string,
  baseBranch: string,
): Promise<string> {
  const params = new URLSearchParams({
    repo: repoFullName,
    branch,
    base: baseBranch,
  });

  const response = await fetch(`/api/v1/github/pr/diff?${params.toString()}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Failed to fetch diff preview';
    throw new Error(message);
  }

  const data = (await response.json()) as { diff: string };
  return data.diff;
}
