import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import githubReducer, {
  clearError,
  setAuthStatus,
  clearConflicts,
  connectGitHub,
  disconnectGitHub,
  fetchRepos,
} from './github-slice';
import type { GitHubState } from '@/types/github';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createStore(preloadedState?: Partial<GitHubState>) {
  return configureStore({
    reducer: { github: githubReducer },
    preloadedState: preloadedState
      ? { github: { ...initialState, ...preloadedState } }
      : undefined,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

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
// Synchronous reducers
// ---------------------------------------------------------------------------

describe('github-slice synchronous reducers', () => {
  it('has the correct initial state', () => {
    const store = createStore();
    const state = store.getState().github;

    expect(state.authStatus).toBe('disconnected');
    expect(state.accessToken).toBeNull();
    expect(state.repos).toEqual([]);
    expect(state.syncConfigs).toEqual([]);
    expect(state.issueLinks).toEqual([]);
    expect(state.commitLinks).toEqual([]);
    expect(state.conflicts).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('clearError sets error to null', () => {
    const store = createStore({ error: 'Something went wrong' });
    store.dispatch(clearError());
    expect(store.getState().github.error).toBeNull();
  });

  it('setAuthStatus updates the auth status', () => {
    const store = createStore();

    store.dispatch(setAuthStatus('connected'));
    expect(store.getState().github.authStatus).toBe('connected');

    store.dispatch(setAuthStatus('expired'));
    expect(store.getState().github.authStatus).toBe('expired');
  });

  it('clearConflicts empties the conflicts array', () => {
    const store = createStore({
      conflicts: [
        {
          path: 'spec.md',
          localContent: 'local',
          remoteContent: 'remote',
          lastLocalUpdate: '2024-01-01',
          lastRemoteUpdate: '2024-01-02',
        },
      ],
    });

    store.dispatch(clearConflicts());
    expect(store.getState().github.conflicts).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

describe('github-slice async thunks', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('connectGitHub', () => {
    it('sets authStatus to connected and stores the access token on success', async () => {
      const payload = { authStatus: 'connected' as const, accessToken: 'gho_abc' };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => payload,
      } as Response);

      const store = createStore();
      await store.dispatch(connectGitHub({ code: 'code123', state: 'state456' }));

      const state = store.getState().github;
      expect(state.authStatus).toBe('connected');
      expect(state.accessToken).toBe('gho_abc');
      expect(state.isLoading).toBe(false);
    });

    it('sets an error message on failure', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      const store = createStore();
      await store.dispatch(connectGitHub({ code: 'bad', state: 'state' }));

      const state = store.getState().github;
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('disconnectGitHub', () => {
    it('resets all state on success', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const store = createStore({
        authStatus: 'connected',
        accessToken: 'gho_abc',
        repos: [
          {
            id: 1,
            name: 'repo',
            fullName: 'owner/repo',
            owner: 'owner',
            defaultBranch: 'main',
            private: false,
            description: '',
            url: '',
            htmlUrl: '',
          },
        ],
      });

      await store.dispatch(disconnectGitHub());

      const state = store.getState().github;
      expect(state.authStatus).toBe('disconnected');
      expect(state.accessToken).toBeNull();
      expect(state.repos).toEqual([]);
      expect(state.syncConfigs).toEqual([]);
      expect(state.issueLinks).toEqual([]);
      expect(state.commitLinks).toEqual([]);
      expect(state.conflicts).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('fetchRepos', () => {
    it('populates the repos array on success', async () => {
      const repos = [
        {
          id: 1,
          name: 'alpha',
          fullName: 'owner/alpha',
          owner: 'owner',
          defaultBranch: 'main',
          private: false,
          description: 'Alpha repo',
          url: 'https://api.github.com/repos/owner/alpha',
          htmlUrl: 'https://github.com/owner/alpha',
        },
        {
          id: 2,
          name: 'beta',
          fullName: 'owner/beta',
          owner: 'owner',
          defaultBranch: 'develop',
          private: true,
          description: 'Beta repo',
          url: 'https://api.github.com/repos/owner/beta',
          htmlUrl: 'https://github.com/owner/beta',
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: repos }),
      } as Response);

      const store = createStore();
      await store.dispatch(fetchRepos());

      const state = store.getState().github;
      expect(state.repos).toHaveLength(2);
      expect(state.repos[0].fullName).toBe('owner/alpha');
      expect(state.repos[1].fullName).toBe('owner/beta');
      expect(state.isLoading).toBe(false);
    });

    it('sets an error message when the fetch fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      const store = createStore();
      await store.dispatch(fetchRepos());

      const state = store.getState().github;
      expect(state.error).toBeTruthy();
      expect(state.repos).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });
});
