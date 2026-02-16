/**
 * Issue linking for F3.1.3 - GitHub Integration
 *
 * Links GitHub issues to spec tree nodes (epics, features, user stories,
 * tasks), syncs issue state, and creates new issues directly from spec
 * content. All GitHub API calls are routed through internal Next.js API
 * routes.
 */

import type { GitHubIssueLink } from '@/types/github';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a link between an existing GitHub issue and a spec node.
 *
 * The backend verifies the issue exists, fetches its current title
 * and state, then persists the link.
 */
export async function linkIssueToSpec(
  repoFullName: string,
  issueNumber: number,
  specNodeType: string,
  specNodeId: string,
): Promise<GitHubIssueLink> {
  const response = await fetch('/api/v1/github/issues/link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repoFullName,
      issueNumber,
      specNodeType,
      specNodeId,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Failed to link issue to spec node';
    throw new Error(message);
  }

  const data = (await response.json()) as { data: GitHubIssueLink };
  return data.data;
}

/**
 * Remove a previously created issue-to-spec link.
 */
export async function unlinkIssue(linkId: string): Promise<void> {
  const response = await fetch(`/api/v1/github/issues/link/${encodeURIComponent(linkId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string' ? body.error : 'Failed to unlink issue';
    throw new Error(message);
  }
}

/**
 * Refresh the issue state (open/closed) and title from GitHub.
 *
 * Returns an updated `GitHubIssueLink` with the latest values.
 */
export async function syncIssueStatus(
  link: GitHubIssueLink,
): Promise<GitHubIssueLink> {
  const response = await fetch('/api/v1/github/issues/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      linkId: link.id,
      repoFullName: link.repoFullName,
      issueNumber: link.issueNumber,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Failed to sync issue status';
    throw new Error(message);
  }

  const data = (await response.json()) as { data: GitHubIssueLink };
  return data.data;
}

/**
 * Create a new GitHub issue from a spec node and automatically link it.
 *
 * The backend creates the issue via the GitHub API, then persists a
 * link between the new issue and the specified spec node.
 */
export async function createIssueFromSpec(
  repoFullName: string,
  specNodeType: string,
  specNodeId: string,
  title: string,
  body: string,
): Promise<GitHubIssueLink> {
  const response = await fetch('/api/v1/github/issues/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repoFullName,
      specNodeType,
      specNodeId,
      title,
      body,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof errorBody.error === 'string'
        ? errorBody.error
        : 'Failed to create issue from spec';
    throw new Error(message);
  }

  const data = (await response.json()) as { data: GitHubIssueLink };
  return data.data;
}

/**
 * Retrieve all issue links associated with a given spec node.
 */
export async function getLinkedIssues(
  specNodeId: string,
): Promise<GitHubIssueLink[]> {
  const params = new URLSearchParams({ specNodeId });
  const response = await fetch(`/api/v1/github/issues/links?${params.toString()}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Failed to fetch linked issues';
    throw new Error(message);
  }

  const data = (await response.json()) as { data: GitHubIssueLink[] };
  return data.data;
}
