/**
 * Redux slice for GitHub integration: OAuth connection, repository sync,
 * issue linking, and pull request creation. Follows the same patterns
 * as webhook-slice.ts.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  GitHubState,
  GitHubAuthStatus,
  GitHubRepo,
  GitHubSyncConfig,
  GitHubIssueLink,
  GitHubPRResult,
} from '@/types/github';

const initialState: GitHubState = {
  authStatus: 'disconnected',
  accessToken: null,
  repos: [],
  syncConfigs: [],
  issueLinks: [],
  commitLinks: [],
  conflicts: [],
  isLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const connectGitHub = createAsyncThunk(
  'github/connectGitHub',
  async (payload: { code: string; state: string }) => {
    const response = await fetch('/api/v1/github/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to connect GitHub');
    return response.json() as Promise<{ authStatus: GitHubAuthStatus; accessToken: string }>;
  }
);

export const disconnectGitHub = createAsyncThunk(
  'github/disconnectGitHub',
  async () => {
    const response = await fetch('/api/v1/github/auth', { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to disconnect GitHub');
  }
);

export const fetchRepos = createAsyncThunk(
  'github/fetchRepos',
  async () => {
    const response = await fetch('/api/v1/github/repos');
    if (!response.ok) throw new Error('Failed to fetch repositories');
    const body = await response.json() as { data: GitHubRepo[] };
    return body.data;
  }
);

export const fetchSyncConfigs = createAsyncThunk(
  'github/fetchSyncConfigs',
  async () => {
    const response = await fetch('/api/v1/github/sync');
    if (!response.ok) throw new Error('Failed to fetch sync configs');
    const body = await response.json() as { data: GitHubSyncConfig[] };
    return body.data;
  }
);

export const createSyncConfig = createAsyncThunk(
  'github/createSyncConfig',
  async (payload: {
    repoFullName: string;
    syncPath: string;
    branch: string;
    autoSync: boolean;
  }) => {
    const response = await fetch('/api/v1/github/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create sync config');
    const body = await response.json() as { data: GitHubSyncConfig };
    return body.data;
  }
);

export const updateSyncConfig = createAsyncThunk(
  'github/updateSyncConfig',
  async ({ id, ...updates }: { id: string } & Partial<{
    syncPath: string;
    branch: string;
    autoSync: boolean;
  }>) => {
    const response = await fetch(`/api/v1/github/sync/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update sync config');
    const body = await response.json() as { data: GitHubSyncConfig };
    return body.data;
  }
);

export const deleteSyncConfig = createAsyncThunk(
  'github/deleteSyncConfig',
  async (id: string) => {
    const response = await fetch(`/api/v1/github/sync/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete sync config');
    return id;
  }
);

export const triggerSync = createAsyncThunk(
  'github/triggerSync',
  async (id: string) => {
    const response = await fetch(`/api/v1/github/sync/${id}/trigger`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to trigger sync');
    const body = await response.json() as { data: GitHubSyncConfig };
    return body.data;
  }
);

export const fetchIssueLinks = createAsyncThunk(
  'github/fetchIssueLinks',
  async (specNodeId: string) => {
    const response = await fetch(`/api/v1/github/issues?specNodeId=${encodeURIComponent(specNodeId)}`);
    if (!response.ok) throw new Error('Failed to fetch issue links');
    const body = await response.json() as { data: GitHubIssueLink[] };
    return body.data;
  }
);

export const linkIssue = createAsyncThunk(
  'github/linkIssue',
  async (payload: {
    repoFullName: string;
    issueNumber: number;
    specNodeType: string;
    specNodeId: string;
  }) => {
    const response = await fetch('/api/v1/github/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to link issue');
    const body = await response.json() as { data: GitHubIssueLink };
    return body.data;
  }
);

export const unlinkIssue = createAsyncThunk(
  'github/unlinkIssue',
  async (id: string) => {
    const response = await fetch(`/api/v1/github/issues/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to unlink issue');
    return id;
  }
);

export const createIssueFromSpec = createAsyncThunk(
  'github/createIssueFromSpec',
  async (payload: { specNodeId: string; specNodeType: string }) => {
    const response = await fetch('/api/v1/github/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, createNew: true }),
    });
    if (!response.ok) throw new Error('Failed to create issue from spec');
    const body = await response.json() as { data: GitHubIssueLink };
    return body.data;
  }
);

export const createPR = createAsyncThunk(
  'github/createPR',
  async (payload: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
    repoFullName: string;
    files: { path: string; content: string }[];
  }) => {
    const response = await fetch('/api/v1/github/pr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create pull request');
    const body = await response.json() as { data: GitHubPRResult };
    return body.data;
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setAuthStatus(state, action: PayloadAction<GitHubAuthStatus>) {
      state.authStatus = action.payload;
    },
    clearConflicts(state) {
      state.conflicts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // connectGitHub
      .addCase(connectGitHub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectGitHub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authStatus = action.payload.authStatus;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(connectGitHub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to connect GitHub';
      })

      // disconnectGitHub
      .addCase(disconnectGitHub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disconnectGitHub.fulfilled, (state) => {
        state.isLoading = false;
        state.authStatus = 'disconnected';
        state.accessToken = null;
        state.repos = [];
        state.syncConfigs = [];
        state.issueLinks = [];
        state.commitLinks = [];
        state.conflicts = [];
      })
      .addCase(disconnectGitHub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to disconnect GitHub';
      })

      // fetchRepos
      .addCase(fetchRepos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRepos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repos = action.payload;
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch repositories';
      })

      // fetchSyncConfigs
      .addCase(fetchSyncConfigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSyncConfigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.syncConfigs = action.payload;
      })
      .addCase(fetchSyncConfigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch sync configs';
      })

      // createSyncConfig
      .addCase(createSyncConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSyncConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.syncConfigs.unshift(action.payload);
      })
      .addCase(createSyncConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create sync config';
      })

      // updateSyncConfig
      .addCase(updateSyncConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSyncConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.syncConfigs.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.syncConfigs[index] = action.payload;
        }
      })
      .addCase(updateSyncConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update sync config';
      })

      // deleteSyncConfig
      .addCase(deleteSyncConfig.fulfilled, (state, action) => {
        state.syncConfigs = state.syncConfigs.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteSyncConfig.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete sync config';
      })

      // triggerSync
      .addCase(triggerSync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(triggerSync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.syncConfigs.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.syncConfigs[index] = action.payload;
        }
      })
      .addCase(triggerSync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to trigger sync';
      })

      // fetchIssueLinks
      .addCase(fetchIssueLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIssueLinks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issueLinks = action.payload;
      })
      .addCase(fetchIssueLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch issue links';
      })

      // linkIssue
      .addCase(linkIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(linkIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issueLinks.unshift(action.payload);
      })
      .addCase(linkIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to link issue';
      })

      // unlinkIssue
      .addCase(unlinkIssue.fulfilled, (state, action) => {
        state.issueLinks = state.issueLinks.filter((l) => l.id !== action.payload);
      })
      .addCase(unlinkIssue.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to unlink issue';
      })

      // createIssueFromSpec
      .addCase(createIssueFromSpec.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIssueFromSpec.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issueLinks.unshift(action.payload);
      })
      .addCase(createIssueFromSpec.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create issue from spec';
      })

      // createPR
      .addCase(createPR.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPR.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createPR.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create pull request';
      });
  },
});

export const { clearError, setAuthStatus, clearConflicts } = githubSlice.actions;
export default githubSlice.reducer;
