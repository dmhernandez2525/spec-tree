import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import GitHubManagementPanel from './GitHubManagementPanel';

// ---------------------------------------------------------------------------
// Mock child components so the panel renders without dependencies
// ---------------------------------------------------------------------------

vi.mock('./GitHubConnectButton', () => ({
  default: () => (
    <div data-testid="github-connect-button">GitHubConnectButton</div>
  ),
}));

vi.mock('./RepoSelector', () => ({
  default: () => <div data-testid="repo-selector">RepoSelector</div>,
}));

vi.mock('./SyncConfigPanel', () => ({
  default: () => <div data-testid="sync-config-panel">SyncConfigPanel</div>,
}));

vi.mock('./IssueLinkPanel', () => ({
  default: () => <div data-testid="issue-link-panel">IssueLinkPanel</div>,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GitHubManagementPanel', () => {
  const initialState = {
    github: {
      authStatus: 'disconnected' as const,
      accessToken: null,
      repos: [],
      syncConfigs: [],
      issueLinks: [],
      commitLinks: [],
      conflicts: [],
      isLoading: false,
      error: null,
    },
  };

  it('renders the panel title "GitHub Integration"', () => {
    render(<GitHubManagementPanel />, { initialState: initialState as never });

    expect(
      screen.getByRole('heading', { name: /github integration/i }),
    ).toBeInTheDocument();
  });

  it('renders tab triggers for Connection, Sync, and Issues', () => {
    render(<GitHubManagementPanel />, { initialState: initialState as never });

    expect(screen.getByRole('tab', { name: /connection/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sync/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /issues/i })).toBeInTheDocument();
  });

  it('renders the connection tab content by default', () => {
    render(<GitHubManagementPanel />, { initialState: initialState as never });

    expect(screen.getByTestId('github-connect-button')).toBeInTheDocument();
    expect(screen.getByTestId('repo-selector')).toBeInTheDocument();
  });

  it('switches to the sync tab when clicked', async () => {
    const { user } = render(<GitHubManagementPanel />, {
      initialState: initialState as never,
    });

    await user.click(screen.getByRole('tab', { name: /sync/i }));

    expect(screen.getByTestId('sync-config-panel')).toBeInTheDocument();
  });

  it('switches to the issues tab when clicked', async () => {
    const { user } = render(<GitHubManagementPanel />, {
      initialState: initialState as never,
    });

    await user.click(screen.getByRole('tab', { name: /issues/i }));

    expect(screen.getByTestId('issue-link-panel')).toBeInTheDocument();
  });
});
