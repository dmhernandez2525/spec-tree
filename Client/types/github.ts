/**
 * GitHub Integration types for F3.1.3 - Repository sync, issue linking,
 * PR generation, and GitHub Actions workflow templates.
 */

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

/** OAuth connection status for the GitHub integration */
export type GitHubAuthStatus = 'connected' | 'disconnected' | 'expired';

/** Sync state between local spec and the remote repository */
export type GitHubSyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

// ---------------------------------------------------------------------------
// Core Interfaces
// ---------------------------------------------------------------------------

/** A GitHub repository available to the authenticated user */
export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  private: boolean;
  description: string;
  url: string;
  htmlUrl: string;
}

/** Configuration for syncing a spec tree with a GitHub repository */
export interface GitHubSyncConfig {
  id: string;
  repoId: number;
  repoFullName: string;
  syncPath: string;
  branch: string;
  autoSync: boolean;
  lastSyncAt: string | null;
  syncStatus: GitHubSyncStatus;
  pendingChanges: number;
}

/** Link between a spec node and a GitHub issue */
export interface GitHubIssueLink {
  id: string;
  specNodeType: 'epic' | 'feature' | 'userStory' | 'task';
  specNodeId: string;
  issueNumber: number;
  issueTitle: string;
  issueState: 'open' | 'closed';
  repoFullName: string;
  linkedAt: string;
}

/** Link between a spec node and a GitHub commit */
export interface GitHubCommitLink {
  sha: string;
  message: string;
  specNodeId: string;
  specNodeType: string;
  timestamp: string;
  author: string;
}

/** Detected conflict between local and remote spec content */
export interface GitHubConflict {
  path: string;
  localContent: string;
  remoteContent: string;
  lastLocalUpdate: string;
  lastRemoteUpdate: string;
}

// ---------------------------------------------------------------------------
// Request / Response Types
// ---------------------------------------------------------------------------

/** File entry included in a pull request */
export interface GitHubPRFile {
  path: string;
  content: string;
}

/** Parameters for creating a pull request with spec content */
export interface GitHubPRRequest {
  title: string;
  body: string;
  branch: string;
  baseBranch: string;
  repoFullName: string;
  files: GitHubPRFile[];
}

/** Result returned after a pull request is created */
export interface GitHubPRResult {
  number: number;
  title: string;
  url: string;
  htmlUrl: string;
  state: string;
}

// ---------------------------------------------------------------------------
// GitHub Actions
// ---------------------------------------------------------------------------

/** Pre-built GitHub Actions workflow template */
export interface GitHubActionsTemplate {
  id: string;
  name: string;
  description: string;
  workflow: string;
}

// ---------------------------------------------------------------------------
// Redux State
// ---------------------------------------------------------------------------

/** Redux slice state for the GitHub integration UI */
export interface GitHubState {
  authStatus: GitHubAuthStatus;
  accessToken: string | null;
  repos: GitHubRepo[];
  syncConfigs: GitHubSyncConfig[];
  issueLinks: GitHubIssueLink[];
  commitLinks: GitHubCommitLink[];
  conflicts: GitHubConflict[];
  isLoading: boolean;
  error: string | null;
}
