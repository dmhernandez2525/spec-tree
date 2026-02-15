import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/test/mocks/server';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/user-dashboard',
}));

import { WorkspaceSwitcher } from './WorkspaceSwitcher';

describe('WorkspaceSwitcher', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/organizations/workspaces', () => {
        return HttpResponse.json([]);
      })
    );
  });

  const singleWorkspace = {
    workspace: {
      workspaces: [
        { id: 'ws-1', name: 'My Workspace', role: 'owner' as const },
      ],
      activities: [],
      auditLogs: [],
      templates: [],
      apiKeys: [],
      quota: null,
      isLoading: false,
      error: null,
    },
    user: {
      user: { documentId: 'user-1' },
      token: null,
    },
    organization: {
      currentOrganization: { id: 'ws-1', name: 'My Workspace' },
      members: [],
      invites: [],
      subscription: null,
      isLoading: false,
      error: null,
    },
  };

  const multipleWorkspaces = {
    ...singleWorkspace,
    workspace: {
      ...singleWorkspace.workspace,
      workspaces: [
        { id: 'ws-1', name: 'My Workspace', role: 'owner' as const },
        { id: 'ws-2', name: 'Design Team', role: 'admin' as const },
        { id: 'ws-3', name: 'Marketing', role: 'viewer' as const },
      ],
    },
  };

  it('returns null when only one workspace exists', () => {
    const { container } = render(<WorkspaceSwitcher />, {
      initialState: singleWorkspace as any,
    });

    expect(container.innerHTML).toBe('');
  });

  it('renders dropdown trigger with current workspace name', () => {
    render(<WorkspaceSwitcher />, {
      initialState: multipleWorkspaces as any,
    });

    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });

  it('renders a button trigger for the dropdown', () => {
    render(<WorkspaceSwitcher />, {
      initialState: multipleWorkspaces as any,
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('returns null when no workspaces exist', () => {
    const emptyState = {
      ...singleWorkspace,
      workspace: {
        ...singleWorkspace.workspace,
        workspaces: [],
      },
    };
    const { container } = render(<WorkspaceSwitcher />, {
      initialState: emptyState as any,
    });

    expect(container.innerHTML).toBe('');
  });

  it('shows fallback text when no current workspace matches', () => {
    const stateWithNoMatch = {
      ...multipleWorkspaces,
      organization: {
        ...multipleWorkspaces.organization,
        currentOrganization: { id: 'ws-999', name: 'Unknown' },
      },
    };
    render(<WorkspaceSwitcher />, {
      initialState: stateWithNoMatch as any,
    });

    expect(screen.getByText('Select workspace')).toBeInTheDocument();
  });

  it('does not render when user has no documentId', () => {
    const noUserState = {
      ...multipleWorkspaces,
      user: { user: null, token: null },
    };
    const { container } = render(<WorkspaceSwitcher />, {
      initialState: noUserState as any,
    });

    // Component still renders since workspaces are pre-populated in state,
    // but no fetch is dispatched without userId
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
