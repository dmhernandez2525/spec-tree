import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/src/test/test-utils';
import type { WorkspaceAPIKey } from '@/types/organization';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/user-dashboard/organization',
}));

import { APIKeyManager } from './APIKeyManager';

describe('APIKeyManager', () => {
  const mockKeys: WorkspaceAPIKey[] = [
    {
      id: 'key-1',
      provider: 'openai',
      label: 'Production OpenAI',
      maskedKey: 'sk-...xxxx',
      isActive: true,
      createdById: 'user-1',
      lastUsedAt: '2024-02-15T09:00:00Z',
    },
    {
      id: 'key-2',
      provider: 'anthropic',
      label: 'Anthropic Dev Key',
      maskedKey: 'sk-ant...yyyy',
      isActive: true,
      createdById: 'user-1',
      lastUsedAt: null,
    },
    {
      id: 'key-3',
      provider: 'gemini',
      label: 'Revoked Gemini Key',
      maskedKey: 'AIza...zzzz',
      isActive: false,
      createdById: 'user-1',
      lastUsedAt: null,
    },
  ];

  const stateWithKeys = {
    workspace: {
      workspaces: [],
      activities: [],
      auditLogs: [],
      templates: [],
      apiKeys: mockKeys,
      quota: null,
      isLoading: false,
      error: null,
    },
    organization: {
      currentOrganization: { id: 'org-123', name: 'Test Org' },
      members: [],
      invites: [],
      subscription: null,
      isLoading: false,
      error: null,
    },
    auth: {
      isLoggedIn: true,
      organizationRole: 'admin',
    },
    user: {
      user: { documentId: 'user-1' },
      token: null,
    },
  };

  it('shows empty state when no keys exist', () => {
    const emptyState = {
      ...stateWithKeys,
      workspace: { ...stateWithKeys.workspace, apiKeys: [] },
    };
    render(<APIKeyManager />, { initialState: emptyState as any });

    expect(screen.getByText('No API keys configured.')).toBeInTheDocument();
  });

  it('renders heading', () => {
    render(<APIKeyManager />, { initialState: stateWithKeys as any });

    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('displays key labels', () => {
    render(<APIKeyManager />, { initialState: stateWithKeys as any });

    expect(screen.getByText('Production OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic Dev Key')).toBeInTheDocument();
    expect(screen.getByText('Revoked Gemini Key')).toBeInTheDocument();
  });

  it('displays provider badges', () => {
    render(<APIKeyManager />, { initialState: stateWithKeys as any });

    expect(screen.getByText('openai')).toBeInTheDocument();
    expect(screen.getByText('anthropic')).toBeInTheDocument();
    expect(screen.getByText('gemini')).toBeInTheDocument();
  });

  it('displays active/revoked status badges', () => {
    render(<APIKeyManager />, { initialState: stateWithKeys as any });

    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges).toHaveLength(2);
    expect(screen.getByText('Revoked')).toBeInTheDocument();
  });

  it('displays masked keys', () => {
    render(<APIKeyManager />, { initialState: stateWithKeys as any });

    expect(screen.getByText('sk-...xxxx')).toBeInTheDocument();
    expect(screen.getByText('sk-ant...yyyy')).toBeInTheDocument();
    expect(screen.getByText('AIza...zzzz')).toBeInTheDocument();
  });

  it('renders Add Key button for admin users', () => {
    render(<APIKeyManager />, { initialState: stateWithKeys as any });

    expect(screen.getByText('Add Key')).toBeInTheDocument();
  });

  it('hides Add Key button for viewer users', () => {
    const viewerState = {
      ...stateWithKeys,
      auth: { isLoggedIn: true, organizationRole: 'viewer' },
    };
    render(<APIKeyManager />, { initialState: viewerState as any });

    expect(screen.queryByText('Add Key')).not.toBeInTheDocument();
  });

  it('shows Revoke buttons only for active keys (admin)', () => {
    render(<APIKeyManager />, { initialState: stateWithKeys as any });

    const revokeButtons = screen.getAllByText('Revoke');
    expect(revokeButtons).toHaveLength(2);
  });

  it('hides Revoke buttons for viewer users', () => {
    const viewerState = {
      ...stateWithKeys,
      auth: { isLoggedIn: true, organizationRole: 'viewer' },
    };
    render(<APIKeyManager />, { initialState: viewerState as any });

    expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
  });
});
